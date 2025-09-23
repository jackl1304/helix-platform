// ========================================
// ARRAY SAFETY UTILITIES - ROBUSTE ARRAY-OPERATIONEN
// ========================================

/**
 * Sichert Array-Operationen gegen alle möglichen Edge-Cases
 * Verhindert .filter(), .map(), .forEach() Fehler bei falschen Datentypen
 */

export function safeArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    // Wenn es ein Objekt ist, versuche es in ein Array zu konvertieren
    if ('data' in data && Array.isArray((data as any).data)) {
      return (data as any).data;
    }
    // Wenn es ein einzelnes Objekt ist, wrappe es in ein Array
    return [data as T];
  }
  
  console.warn('[ArraySafety] Invalid data type for array operation:', typeof data, data);
  return [];
}

export function safeFilter<T>(data: unknown, predicate: (item: T) => boolean): T[] {
  const safeData = safeArray<T>(data);
  try {
    return safeData.filter(predicate);
  } catch (error) {
    console.error('[ArraySafety] Filter operation failed:', error);
    return [];
  }
}

export function safeMap<T, U>(data: unknown, mapper: (item: T, index: number) => U): U[] {
  const safeData = safeArray<T>(data);
  try {
    return safeData.map(mapper);
  } catch (error) {
    console.error('[ArraySafety] Map operation failed:', error);
    return [];
  }
}

export function safeForEach<T>(data: unknown, callback: (item: T, index: number) => void): void {
  const safeData = safeArray<T>(data);
  try {
    safeData.forEach(callback);
  } catch (error) {
    console.error('[ArraySafety] ForEach operation failed:', error);
  }
}

export function safeFind<T>(data: unknown, predicate: (item: T) => boolean): T | undefined {
  const safeData = safeArray<T>(data);
  try {
    return safeData.find(predicate);
  } catch (error) {
    console.error('[ArraySafety] Find operation failed:', error);
    return undefined;
  }
}

export function safeSome<T>(data: unknown, predicate: (item: T) => boolean): boolean {
  const safeData = safeArray<T>(data);
  try {
    return safeData.some(predicate);
  } catch (error) {
    console.error('[ArraySafety] Some operation failed:', error);
    return false;
  }
}

export function safeEvery<T>(data: unknown, predicate: (item: T) => boolean): boolean {
  const safeData = safeArray<T>(data);
  try {
    return safeData.every(predicate);
  } catch (error) {
    console.error('[ArraySafety] Every operation failed:', error);
    return false;
  }
}

export function safeLength(data: unknown): number {
  const safeData = safeArray(data);
  return safeData.length;
}

export function safeUnique<T>(data: unknown, keyExtractor?: (item: T) => any): T[] {
  const safeData = safeArray<T>(data);
  try {
    if (keyExtractor) {
      const seen = new Set();
      return safeData.filter(item => {
        const key = keyExtractor(item);
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    } else {
      return [...new Set(safeData)];
    }
  } catch (error) {
    console.error('[ArraySafety] Unique operation failed:', error);
    return [];
  }
}

/**
 * Hook für sichere Array-Operationen in React-Komponenten
 */
export function useSafeArray<T>(data: unknown): T[] {
  return safeArray<T>(data);
}

