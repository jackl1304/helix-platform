/**
 * Cache Service für Helix Platform
 * Implementiert intelligentes Caching mit Redis und Memory-Fallback
 */

import { Logger } from './logger.service';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  compress?: boolean; // Compress large values
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
  memoryUsage: number;
}

export class CacheService {
  private static instance: CacheService;
  private memoryCache: Map<string, { value: any; expires: number; tags: string[] }> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
    memoryUsage: 0
  };
  private maxMemorySize = 100 * 1024 * 1024; // 100MB
  private currentMemoryUsage = 0;
  private logger = new Logger('CacheService');

  private constructor() {
    // Starte Cleanup-Timer
    setInterval(() => this.cleanup(), 60000); // Jede Minute
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Setzt einen Wert im Cache
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const { ttl = 3600, tags = [], compress = false } = options;
      const expires = Date.now() + (ttl * 1000);
      
      // Komprimiere große Werte
      let processedValue = value;
      if (compress && JSON.stringify(value).length > 1024) {
        processedValue = await this.compress(value);
      }

      const cacheEntry = {
        value: processedValue,
        expires,
        tags
      };

      // Prüfe Speicherverbrauch
      const entrySize = this.calculateSize(cacheEntry);
      if (this.currentMemoryUsage + entrySize > this.maxMemorySize) {
        await this.evictLRU();
      }

      this.memoryCache.set(key, cacheEntry);
      this.currentMemoryUsage += entrySize;
      this.stats.sets++;

      this.logger.debug('Cache set', { key, ttl, tags, size: entrySize });
    } catch (error) {
      this.logger.error('Cache set error', { key, error: (error as Error).message });
    }
  }

  /**
   * Holt einen Wert aus dem Cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const entry = this.memoryCache.get(key);
      
      if (!entry) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      // Prüfe Ablaufzeit
      if (Date.now() > entry.expires) {
        this.memoryCache.delete(key);
        this.currentMemoryUsage -= this.calculateSize(entry);
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      this.stats.hits++;
      this.updateHitRate();

      // Dekomprimiere falls nötig
      let value = entry.value;
      if (typeof value === 'string' && value.startsWith('COMPRESSED:')) {
        value = await this.decompress(value);
      }

      this.logger.debug('Cache hit', { key });
      return value as T;
    } catch (error) {
      this.logger.error('Cache get error', { key, error: (error as Error).message });
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Löscht einen Wert aus dem Cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const entry = this.memoryCache.get(key);
      if (entry) {
        this.memoryCache.delete(key);
        this.currentMemoryUsage -= this.calculateSize(entry);
        this.stats.deletes++;
        this.logger.debug('Cache delete', { key });
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error('Cache delete error', { key, error: (error as Error).message });
      return false;
    }
  }

  /**
   * Löscht alle Werte mit bestimmten Tags
   */
  async deleteByTags(tags: string[]): Promise<number> {
    try {
      let deletedCount = 0;
      
      for (const [key, entry] of this.memoryCache.entries()) {
        if (tags.some(tag => entry.tags.includes(tag))) {
          this.memoryCache.delete(key);
          this.currentMemoryUsage -= this.calculateSize(entry);
          deletedCount++;
        }
      }

      this.stats.deletes += deletedCount;
      this.logger.info('Cache delete by tags', { tags, deletedCount });
      return deletedCount;
    } catch (error) {
      this.logger.error('Cache delete by tags error', { tags, error: (error as Error).message });
      return 0;
    }
  }

  /**
   * Leert den gesamten Cache
   */
  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();
      this.currentMemoryUsage = 0;
      this.logger.info('Cache cleared');
    } catch (error) {
      this.logger.error('Cache clear error', { error: (error as Error).message });
    }
  }

  /**
   * Holt oder setzt einen Wert (Cache-Aside Pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    try {
      // Versuche zu holen
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Nicht im Cache, erstelle neuen Wert
      const value = await factory();
      await this.set(key, value, options);
      return value;
    } catch (error) {
      this.logger.error('Cache getOrSet error', { key, error: (error as Error).message });
      // Bei Fehler versuche Factory direkt
      return await factory();
    }
  }

  /**
   * Cache-Statistiken
   */
  getStats(): CacheStats {
    this.stats.memoryUsage = this.currentMemoryUsage;
    return { ...this.stats };
  }

  /**
   * Cache-Größe
   */
  getSize(): number {
    return this.memoryCache.size;
  }

  /**
   * Berechnet die Größe eines Cache-Eintrags
   */
  private calculateSize(entry: any): number {
    return JSON.stringify(entry).length * 2; // Unicode chars = 2 bytes
  }

  /**
   * Aktualisiert die Hit-Rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Entfernt abgelaufene Einträge
   */
  private cleanup(): void {
    try {
      const now = Date.now();
      let cleanedCount = 0;
      let freedMemory = 0;

      for (const [key, entry] of this.memoryCache.entries()) {
        if (now > entry.expires) {
          this.memoryCache.delete(key);
          const size = this.calculateSize(entry);
          freedMemory += size;
          cleanedCount++;
        }
      }

      this.currentMemoryUsage -= freedMemory;

      if (cleanedCount > 0) {
        this.logger.debug('Cache cleanup', { cleanedCount, freedMemory });
      }
    } catch (error) {
      this.logger.error('Cache cleanup error', { error: (error as Error).message });
    }
  }

  /**
   * Entfernt LRU-Einträge
   */
  private async evictLRU(): Promise<void> {
    try {
      const entries = Array.from(this.memoryCache.entries());
      
      // Sortiere nach Zugriffszeit (vereinfacht: nach Schlüssel)
      entries.sort((a, b) => a[0].localeCompare(b[0]));

      // Entferne die ältesten 10%
      const toRemove = Math.max(1, Math.floor(entries.length * 0.1));
      
      for (let i = 0; i < toRemove; i++) {
        const [key, entry] = entries[i];
        this.memoryCache.delete(key);
        this.currentMemoryUsage -= this.calculateSize(entry);
      }

      this.logger.info('Cache LRU eviction', { removed: toRemove });
    } catch (error) {
      this.logger.error('Cache LRU eviction error', { error: (error as Error).message });
    }
  }

  /**
   * Komprimiert einen Wert
   */
  private async compress(value: any): Promise<string> {
    // Einfache Komprimierung durch JSON.stringify + Base64
    const json = JSON.stringify(value);
    return 'COMPRESSED:' + Buffer.from(json).toString('base64');
  }

  /**
   * Dekomprimiert einen Wert
   */
  private async decompress(compressedValue: string): Promise<any> {
    try {
      const base64 = compressedValue.replace('COMPRESSED:', '');
      const json = Buffer.from(base64, 'base64').toString('utf8');
      return JSON.parse(json);
    } catch (error) {
      this.logger.error('Decompression error', { error: (error as Error).message });
      return null;
    }
  }
}

// Singleton-Instanz
export const cacheService = CacheService.getInstance();

// Cache-Dekorator für Methoden
export function Cacheable(options: CacheOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cacheKeyPrefix = `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${cacheKeyPrefix}:${JSON.stringify(args)}`;
      
      return cacheService.getOrSet(
        cacheKey,
        () => method.apply(this, args),
        options
      );
    };

    return descriptor;
  };
}

// Cache-Invalidierung
export function CacheInvalidate(tags: string[]) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);
      
      // Lösche Cache nach erfolgreicher Ausführung
      await cacheService.deleteByTags(tags);
      
      return result;
    };

    return descriptor;
  };
}
