import { storage } from '../storage';
import { businessLogger, LoggingUtils } from '../utils/logger';

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  authority: string;
  region: string;
  active: boolean;
  lastCheck: Date;
  checkFrequency: number; // minutes
}

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  categories?: string[];
  author?: string;
}

interface ParsedRSSData {
  feedUrl: string;
  title: string;
  description: string;
  items: RSSItem[];
  lastBuildDate?: string;
}

export class RSSMonitoringService {
  private feeds: RSSFeed[] = [
    {
      id: 'fda-main',
      name: 'FDA News & Updates',
      url: 'https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds-fda',
      authority: 'FDA',
      region: 'United States',
      active: true,
      lastCheck: new Date(0),
      checkFrequency: 60 // Check every hour
    },
    {
      id: 'fda-medical-devices',
      name: 'FDA Medical Device Safety',
      url: 'https://www.fda.gov/medical-devices/rss.xml',
      authority: 'FDA',
      region: 'United States',
      active: true,
      lastCheck: new Date(0),
      checkFrequency: 60
    },
    {
      id: 'ema-main',
      name: 'EMA News & Updates',
      url: 'https://www.ema.europa.eu/en/rss.xml',
      authority: 'EMA',
      region: 'European Union',
      active: true,
      lastCheck: new Date(0),
      checkFrequency: 120 // Check every 2 hours
    },
    {
      id: 'bfarm-main',
      name: 'BfArM Updates',
      url: 'https://www.bfarm.de/DE/Service/RSS/_node.html',
      authority: 'BfArM',
      region: 'Germany',
      active: true,
      lastCheck: new Date(0),
      checkFrequency: 180 // Check every 3 hours
    },
    {
      id: 'swissmedic-main',
      name: 'Swissmedic Updates',
      url: 'https://www.swissmedic.ch/swissmedic/de/home.rss.html',
      authority: 'Swissmedic',
      region: 'Switzerland',
      active: true,
      lastCheck: new Date(0),
      checkFrequency: 180
    },
    {
      id: 'mhra-main',
      name: 'MHRA Updates',
      url: 'https://www.gov.uk/government/organisations/medicines-and-healthcare-products-regulatory-agency.atom',
      authority: 'MHRA',
      region: 'United Kingdom',
      active: true,
      lastCheck: new Date(0),
      checkFrequency: 120
    }
  ];

  private rateLimitDelay = 2000; // 2 seconds between requests
  private isMonitoring = false;

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async parseFeedFromContent(content: string): Promise<ParsedRSSData | null> {
    try {
      // Simple RSS/Atom parser implementation
      // In a real implementation, you'd use a proper XML parser like 'fast-xml-parser'
      
      const titleMatch = content.match(/<title[^>]*>([\s\S]*?)<\/title>/);
      const descriptionMatch = content.match(/<description[^>]*>([\s\S]*?)<\/description>/);
      const lastBuildDateMatch = content.match(/<lastBuildDate[^>]*>([\s\S]*?)<\/lastBuildDate>/);
      
      // Extract items (ohne 's' flag für ältere TypeScript Versionen)
      const itemMatches = content.match(/<item[^>]*>[\s\S]*?<\/item>/g) || 
                         content.match(/<entry[^>]*>[\s\S]*?<\/entry>/g) || [];
      
      const items: RSSItem[] = [];
      
      for (const itemContent of itemMatches) {
        const item = this.parseRSSItem(itemContent);
        if (item) items.push(item);
      }
      
      return {
        feedUrl: '',
        title: this.cleanText(titleMatch?.[1] || 'Unknown Feed'),
        description: this.cleanText(descriptionMatch?.[1] || ''),
        items,
        lastBuildDate: lastBuildDateMatch?.[1]
      };
    } catch (error) {
      logger.error('[RSS] Error parsing feed content:', error);
      return null;
    }
  }

  private parseRSSItem(itemContent: string): RSSItem | null {
    try {
      const titleMatch = itemContent.match(/<title[^>]*>([\s\S]*?)<\/title>/);
      const linkMatch = itemContent.match(/<link[^>]*>([\s\S]*?)<\/link>/) ||
                       itemContent.match(/<link[^>]*href=["'](.*?)["'][^>]*>/);
      const descriptionMatch = itemContent.match(/<description[^>]*>([\s\S]*?)<\/description>/) ||
                              itemContent.match(/<summary[^>]*>([\s\S]*?)<\/summary>/) ||
                              itemContent.match(/<content[^>]*>([\s\S]*?)<\/content>/);
      const pubDateMatch = itemContent.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/) ||
                          itemContent.match(/<published[^>]*>([\s\S]*?)<\/published>/) ||
                          itemContent.match(/<updated[^>]*>([\s\S]*?)<\/updated>/);
      const guidMatch = itemContent.match(/<guid[^>]*>([\s\S]*?)<\/guid>/) ||
                       itemContent.match(/<id[^>]*>([\s\S]*?)<\/id>/);
      const authorMatch = itemContent.match(/<author[^>]*>([\s\S]*?)<\/author>/) ||
                         itemContent.match(/<dc:creator[^>]*>([\s\S]*?)<\/dc:creator>/);
      
      // Extract categories
      const categoryMatches = itemContent.match(/<category[^>]*>(.*?)<\/category>/g) || [];
      const categories = categoryMatches.map(cat => {
        const match = cat.match(/<category[^>]*>(.*?)<\/category>/);
        return match ? this.cleanText(match[1]) : '';
      }).filter(Boolean);
      
      if (!titleMatch) return null;
      
      return {
        title: this.cleanText(titleMatch[1]),
        link: this.cleanText(linkMatch?.[1] || ''),
        description: this.cleanText(descriptionMatch?.[1] || ''),
        pubDate: pubDateMatch?.[1] || new Date().toISOString(),
        guid: guidMatch?.[1] || `rss-${Date.now()}-${crypto.randomUUID().substr(0, 9)}`,
        categories,
        author: authorMatch ? this.cleanText(authorMatch[1]) : undefined
      };
    } catch (error) {
      logger.error('[RSS] Error parsing RSS item:', error);
      return null;
    }
  }

  private cleanText(text: string): string {
    return text
      .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  async fetchFeed(feedUrl: string): Promise<ParsedRSSData | null> {
    try {
      logger.info('Fetching feed: ${feedUrl}', { context: 'RSS' });
      
      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Helix-RSS-Monitor/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const content = await response.text();
      await this.delay(this.rateLimitDelay);
      
      const parsed = await this.parseFeedFromContent(content);
      if (parsed) {
        parsed.feedUrl = feedUrl;
      }
      
      return parsed;
    } catch (error) {
      logger.error('[RSS] Error fetching feed ${feedUrl}:', error);
      return null;
    }
  }

  async processFeedUpdate(feed: RSSFeed, feedData: ParsedRSSData): Promise<void> {
    try {
      logger.info('Processing ${feedData.items.length} items from ${feed.name}', { context: 'RSS' });
      
      for (const item of feedData.items) {
        await this.processRSSItem(feed, item);
      }
      
      // Update last check time
      feed.lastCheck = new Date();
      logger.info('Completed processing feed: ${feed.name}', { context: 'RSS' });
    } catch (error) {
      logger.error('[RSS] Error processing feed update for ${feed.name}:', error);
    }
  }

  private async processRSSItem(feed: RSSFeed, item: RSSItem): Promise<void> {
    try {
      // Check if we already have this item (by GUID or URL)
      const existingId = `rss-${feed.id}-${this.generateItemId(item)}`;
      
      const regulatoryUpdate = {
        id: existingId,
        title: `${feed.authority}: ${item.title}`,
        content: this.formatRSSContent(item, feed),
        source: `${feed.name} (RSS)`,
        type: 'RSS Update',
        region: feed.region,
        authority: feed.authority,
        priority: this.determineRSSPriority(item, feed),
        published_at: this.parseRSSDate(item.pubDate),
        status: 'published',
        metadata: {
          feedId: feed.id,
          feedName: feed.name,
          originalLink: item.link,
          guid: item.guid,
          categories: item.categories || [],
          author: item.author,
          rssFeedUrl: feed.url
        }
      };
      
      await storage.createRegulatoryUpdate(regulatoryUpdate);
      logger.info('Successfully created update from RSS: ${item.title}', { context: 'RSS' });
    } catch (error) {
      // Likely a duplicate, which is expected
      if (!error.message?.includes('duplicate')) {
        logger.error('[RSS] Error processing RSS item:', error);
      }
    }
  }

  private generateItemId(item: RSSItem): string {
    // Generate a consistent ID based on GUID or link or title
    const baseString = item.guid || item.link || item.title;
    return baseString.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substr(0, 20);
  }

  private formatRSSContent(item: RSSItem, feed: RSSFeed): string {
    const parts = [];
    
    parts.push(`**Source:** ${feed.name}`);
    if (item.author) parts.push(`**Author:** ${item.author}`);
    if (item.categories && item.categories.length > 0) {
      parts.push(`**Categories:** ${item.categories.join(', ')}`);
    }
    if (item.link) parts.push(`**Original Link:** ${item.link}`);
    
    if (item.description) {
      parts.push(`**Description:**\n${item.description}`);
    }
    
    return parts.join('\n\n');
  }

  private determineRSSPriority(item: RSSItem, feed: RSSFeed): 'low' | 'medium' | 'high' | 'critical' {
    const title = item.title.toLowerCase();
    const description = item.description.toLowerCase();
    const content = `${title} ${description}`;
    
    // Critical keywords
    if (content.includes('recall') || content.includes('safety alert') || 
        content.includes('urgent') || content.includes('immediate action')) {
      return 'critical';
    }
    
    // High priority keywords
    if (content.includes('warning') || content.includes('guidance') ||
        content.includes('approval') || content.includes('clearance')) {
      return 'high';
    }
    
    // Medium priority for regulatory announcements
    if (content.includes('announcement') || content.includes('update') ||
        content.includes('new') || content.includes('change')) {
      return 'medium';
    }
    
    return 'low';
  }

  private parseRSSDate(dateString: string): Date {
    try {
      // Handle various RSS date formats
      let parsed = new Date(dateString);
      
      if (isNaN(parsed.getTime())) {
        // Try parsing common RSS date formats
        const formats = [
          /\w{3}, \d{2} \w{3} \d{4} \d{2}:\d{2}:\d{2}/, // RFC 822
          /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO 8601
        ];
        
        for (const format of formats) {
          if (format.test(dateString)) {
            parsed = new Date(dateString);
            if (!isNaN(parsed.getTime())) break;
          }
        }
      }
      
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    } catch (error) {
      logger.warn('Could not parse date: ${dateString}', { context: 'RSS' });
      return new Date();
    }
  }

  async checkFeed(feed: RSSFeed): Promise<void> {
    try {
      const now = new Date();
      const timeSinceLastCheck = now.getTime() - feed.lastCheck.getTime();
      const checkInterval = feed.checkFrequency * 60 * 1000; // Convert to milliseconds
      
      if (timeSinceLastCheck < checkInterval) {
        logger.info('Skipping ${feed.name} - checked ${Math.round(timeSinceLastCheck / 60000)} minutes ago', { context: 'RSS' });
        return;
      }
      
      logger.info('Checking feed: ${feed.name}', { context: 'RSS' });
      const feedData = await this.fetchFeed(feed.url);
      
      if (feedData) {
        await this.processFeedUpdate(feed, feedData);
      } else {
        logger.warn('Failed to fetch feed: ${feed.name}', { context: 'RSS' });
      }
    } catch (error: any) {
      logger.error('[RSS] Error checking feed ${feed.name}:', error);
    }
  }

  async monitorAllFeeds(): Promise<void> {
    if (this.isMonitoring) {
      logger.info('Monitoring already in progress', { context: 'RSS' });
      return;
    }
    
    try {
      this.isMonitoring = true;
      logger.info('Starting RSS monitoring cycle', { context: 'RSS' });
      
      const activeFeeds = this.feeds.filter(feed => feed.active);
      logger.info('Monitoring ${activeFeeds.length} active feeds', { context: 'RSS' });
      
      for (const feed of activeFeeds) {
        await this.checkFeed(feed);
        await this.delay(1000); // Small delay between feeds
      }
      
      logger.info('RSS monitoring cycle completed', { context: 'RSS' });
    } catch (error) {
      logger.error('[RSS] Error in RSS monitoring:', error);
    } finally {
      this.isMonitoring = false;
    }
  }

  async startContinuousMonitoring(): Promise<void> {
    logger.info('Starting continuous RSS monitoring', { context: 'RSS' });
    
    // Monitor immediately
    await this.monitorAllFeeds();
    
    // Set up interval for ongoing monitoring (every 30 minutes)
    setInterval(async () => {
      await this.monitorAllFeeds();
    }, 30 * 60 * 1000);
  }

  getFeeds(): RSSFeed[] {
    return [...this.feeds];
  }

  getFeedStatus(): any {
    return this.feeds.map(feed => ({
      id: feed.id,
      name: feed.name,
      authority: feed.authority,
      region: feed.region,
      active: feed.active,
      lastCheck: feed.lastCheck,
      checkFrequency: feed.checkFrequency,
      status: this.isMonitoring ? 'monitoring' : 'idle'
    }));
  }
}