import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from './logger.service';

interface RegulatorySource {
  name: string;
  baseUrl: string;
  endpoints: {
    approvals: string;
    updates: string;
    rss: string;
  };
  parser: 'xml' | 'html' | 'json';
  headers?: Record<string, string>;
}

interface ScrapedApproval {
  id: string;
  title: string;
  type: string;
  status: string;
  region: string;
  authority: string;
  applicant: string;
  deviceClass: string;
  submittedDate: string;
  decisionDate?: string;
  summary: string;
  priority: string;
  category: string;
  tags: string[];
  url: string;
  fullText?: string;
  attachments?: string[];
  relatedDocuments?: string[];
}

interface ScrapedRegulatoryUpdate {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  published_at: string;
  created_at: string;
  authority: string;
  region: string;
  priority: string;
  language: string;
  source: string;
  url: string;
  fullText?: string;
  attachments?: string[];
  relatedUpdates?: string[];
}

export class RegulatoryDataScraperService {
  private sources: RegulatorySource[] = [
    {
      name: 'FDA',
      baseUrl: 'https://www.fda.gov',
      endpoints: {
        approvals: '/medical-devices/510k-clearances',
        updates: '/news-events/fda-newsroom/press-announcements',
        rss: '/news-events/fda-newsroom/press-announcements/rss.xml'
      },
      parser: 'xml'
    },
    {
      name: 'EMA',
      baseUrl: 'https://www.ema.europa.eu',
      endpoints: {
        approvals: '/en/human-regulatory/overview/medical-devices',
        updates: '/en/news',
        rss: '/en/news/rss.xml'
      },
      parser: 'xml'
    },
    {
      name: 'BfArM',
      baseUrl: 'https://www.bfarm.de',
      endpoints: {
        approvals: '/DE/Medizinprodukte/_node.html',
        updates: '/DE/Service/Presse/_node.html',
        rss: '/DE/Service/Presse/_node.html'
      },
      parser: 'html'
    },
    {
      name: 'Health Canada',
      baseUrl: 'https://www.canada.ca',
      endpoints: {
        approvals: '/en/health-canada/services/drugs-health-products/medical-devices.html',
        updates: '/en/health-canada/news.html',
        rss: '/en/health-canada/news.rss'
      },
      parser: 'xml'
    },
    {
      name: 'TGA',
      baseUrl: 'https://www.tga.gov.au',
      endpoints: {
        approvals: '/news-and-updates',
        updates: '/news-and-updates',
        rss: '/news-and-updates/rss.xml'
      },
      parser: 'xml'
    },
    {
      name: 'PMDA',
      baseUrl: 'https://www.pmda.go.jp',
      endpoints: {
        approvals: '/english/review-services/outline/0002.html',
        updates: '/english/news-events.html',
        rss: '/english/news-events.rss'
      },
      parser: 'html'
    }
  ];

  async scrapeAllApprovals(): Promise<ScrapedApproval[]> {
    const allApprovals: ScrapedApproval[] = [];
    
    for (const source of this.sources) {
      try {
        logger.info(`[SCRAPER] Scraping approvals from ${source.name}`);
        const approvals = await this.scrapeApprovalsFromSource(source);
        allApprovals.push(...approvals);
        logger.info(`[SCRAPER] Found ${approvals.length} approvals from ${source.name}`);
      } catch (error) {
        logger.error(`[SCRAPER] Error scraping ${source.name}:`, error);
      }
    }
    
    return allApprovals;
  }

  async scrapeAllRegulatoryUpdates(): Promise<ScrapedRegulatoryUpdate[]> {
    const allUpdates: ScrapedRegulatoryUpdate[] = [];
    
    for (const source of this.sources) {
      try {
        logger.info(`[SCRAPER] Scraping updates from ${source.name}`);
        const updates = await this.scrapeUpdatesFromSource(source);
        allUpdates.push(...updates);
        logger.info(`[SCRAPER] Found ${updates.length} updates from ${source.name}`);
      } catch (error) {
        logger.error(`[SCRAPER] Error scraping ${source.name}:`, error);
      }
    }
    
    return allUpdates;
  }

  private async scrapeApprovalsFromSource(source: RegulatorySource): Promise<ScrapedApproval[]> {
    try {
      const response = await axios.get(source.baseUrl + source.endpoints.approvals, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...source.headers
        },
        timeout: 10000
      });

      if (source.parser === 'html') {
        return this.parseHTMLApprovals(response.data, source);
      } else if (source.parser === 'xml') {
        return this.parseXMLApprovals(response.data, source);
      } else {
        return this.parseJSONApprovals(response.data, source);
      }
    } catch (error) {
      logger.error(`[SCRAPER] Error fetching approvals from ${source.name}:`, error);
      return [];
    }
  }

  private async scrapeUpdatesFromSource(source: RegulatorySource): Promise<ScrapedRegulatoryUpdate[]> {
    try {
      // Try RSS first
      if (source.endpoints.rss) {
        const rssResponse = await axios.get(source.baseUrl + source.endpoints.rss, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            ...source.headers
          },
          timeout: 10000
        });
        
        if (rssResponse.status === 200) {
          return this.parseRSSUpdates(rssResponse.data, source);
        }
      }

      // Fallback to HTML page
      const response = await axios.get(source.baseUrl + source.endpoints.updates, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...source.headers
        },
        timeout: 10000
      });

      return this.parseHTMLUpdates(response.data, source);
    } catch (error) {
      logger.error(`[SCRAPER] Error fetching updates from ${source.name}:`, error);
      return [];
    }
  }

  private parseHTMLApprovals(html: string, source: RegulatorySource): ScrapedApproval[] {
    const $ = cheerio.load(html);
    const approvals: ScrapedApproval[] = [];

    // FDA specific parsing
    if (source.name === 'FDA') {
      $('.views-row').each((index, element) => {
        const $el = $(element);
        const title = $el.find('h3 a, h4 a').text().trim();
        const link = $el.find('h3 a, h4 a').attr('href');
        const summary = $el.find('.field-content p').text().trim();
        
        if (title && link) {
          approvals.push({
            id: `fda_scraped_${index}`,
            title,
            type: '510k',
            status: 'approved',
            region: 'US',
            authority: 'FDA',
            applicant: 'Various',
            deviceClass: 'II',
            submittedDate: new Date().toISOString(),
            decisionDate: new Date().toISOString(),
            summary: summary || title,
            priority: 'medium',
            category: 'device',
            tags: this.extractTags(title + ' ' + summary),
            url: link.startsWith('http') ? link : source.baseUrl + link,
            fullText: summary
          });
        }
      });
    }

    // EMA specific parsing
    if (source.name === 'EMA') {
      $('.ecl-list-item').each((index, element) => {
        const $el = $(element);
        const title = $el.find('.ecl-list-item__title a').text().trim();
        const link = $el.find('.ecl-list-item__title a').attr('href');
        const summary = $el.find('.ecl-list-item__body').text().trim();
        
        if (title && link) {
          approvals.push({
            id: `ema_scraped_${index}`,
            title,
            type: 'mdr',
            status: 'approved',
            region: 'EU',
            authority: 'EMA',
            applicant: 'Various',
            deviceClass: 'II',
            submittedDate: new Date().toISOString(),
            decisionDate: new Date().toISOString(),
            summary: summary || title,
            priority: 'medium',
            category: 'device',
            tags: this.extractTags(title + ' ' + summary),
            url: link.startsWith('http') ? link : source.baseUrl + link,
            fullText: summary
          });
        }
      });
    }

    return approvals;
  }

  private parseXMLApprovals(xml: string, source: RegulatorySource): ScrapedApproval[] {
    // Basic XML parsing for RSS feeds
    const approvals: ScrapedApproval[] = [];
    
    // This would need a proper XML parser in a real implementation
    // For now, return empty array as we're focusing on HTML parsing
    return approvals;
  }

  private parseJSONApprovals(json: string, source: RegulatorySource): ScrapedApproval[] {
    // JSON parsing for APIs that return JSON
    const approvals: ScrapedApproval[] = [];
    
    try {
      const data = JSON.parse(json);
      // Parse based on the specific API structure
      return approvals;
    } catch (error) {
      logger.error(`[SCRAPER] Error parsing JSON from ${source.name}:`, error);
      return approvals;
    }
  }

  private parseRSSUpdates(xml: string, source: RegulatorySource): ScrapedRegulatoryUpdate[] {
    const $ = cheerio.load(xml, { xmlMode: true });
    const updates: ScrapedRegulatoryUpdate[] = [];

    $('item').each((index, element) => {
      const $el = $(element);
      const title = $el.find('title').text().trim();
      const description = $el.find('description').text().trim();
      const link = $el.find('link').text().trim();
      const pubDate = $el.find('pubDate').text().trim();
      
      if (title && description) {
        updates.push({
          id: `${source.name.toLowerCase()}_scraped_${index}`,
          title,
          content: description,
          category: 'regulatory_guidance',
          tags: this.extractTags(title + ' ' + description),
          published_at: pubDate || new Date().toISOString(),
          created_at: new Date().toISOString(),
          authority: source.name,
          region: this.getRegionFromAuthority(source.name),
          priority: this.determinePriority(title, description),
          language: 'en',
          source: source.name,
          url: link || source.baseUrl,
          fullText: description
        });
      }
    });

    return updates;
  }

  private parseHTMLUpdates(html: string, source: RegulatorySource): ScrapedRegulatoryUpdate[] {
    const $ = cheerio.load(html);
    const updates: ScrapedRegulatoryUpdate[] = [];

    // Generic parsing for news/update pages
    $('.news-item, .article, .press-release, .update-item').each((index, element) => {
      const $el = $(element);
      const title = $el.find('h1, h2, h3, h4, .title, .headline').first().text().trim();
      const content = $el.find('.content, .summary, .description, p').first().text().trim();
      const link = $el.find('a').first().attr('href');
      
      if (title && content) {
        updates.push({
          id: `${source.name.toLowerCase()}_scraped_${index}`,
          title,
          content,
          category: 'regulatory_guidance',
          tags: this.extractTags(title + ' ' + content),
          published_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          authority: source.name,
          region: this.getRegionFromAuthority(source.name),
          priority: this.determinePriority(title, content),
          language: 'en',
          source: source.name,
          url: link ? (link.startsWith('http') ? link : source.baseUrl + link) : source.baseUrl,
          fullText: content
        });
      }
    });

    return updates;
  }

  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const lowerText = text.toLowerCase();
    
    // Medical device related tags
    if (lowerText.includes('medical device')) tags.push('medical device');
    if (lowerText.includes('510k')) tags.push('510k');
    if (lowerText.includes('pma')) tags.push('pma');
    if (lowerText.includes('ce marking')) tags.push('ce marking');
    if (lowerText.includes('mdr')) tags.push('mdr');
    if (lowerText.includes('ivdr')) tags.push('ivdr');
    if (lowerText.includes('iso')) tags.push('iso');
    if (lowerText.includes('quality')) tags.push('quality');
    if (lowerText.includes('safety')) tags.push('safety');
    if (lowerText.includes('clinical')) tags.push('clinical');
    if (lowerText.includes('diagnostic')) tags.push('diagnostic');
    if (lowerText.includes('therapeutic')) tags.push('therapeutic');
    if (lowerText.includes('software')) tags.push('software');
    if (lowerText.includes('ai')) tags.push('ai');
    if (lowerText.includes('digital')) tags.push('digital');
    
    return tags;
  }

  private getRegionFromAuthority(authority: string): string {
    const regionMap: Record<string, string> = {
      'FDA': 'US',
      'EMA': 'Europe',
      'BfArM': 'Germany',
      'Health Canada': 'Canada',
      'TGA': 'Australia',
      'PMDA': 'Japan',
      'MHRA': 'UK',
      'NMPA': 'China',
      'CDSCO': 'India',
      'MFDS': 'South Korea',
      'HSA': 'Singapore',
      'ANVISA': 'Brazil',
      'ANMAT': 'Argentina',
      'SFDA': 'Saudi Arabia',
      'SAHPRA': 'South Africa'
    };
    
    return regionMap[authority] || 'Global';
  }

  private determinePriority(title: string, content: string): string {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('urgent') || text.includes('critical') || text.includes('recall')) {
      return 'high';
    } else if (text.includes('important') || text.includes('update') || text.includes('new')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  async getDetailedContent(url: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      const $ = cheerio.load(response.data);
      
      // Remove scripts, styles, and other non-content elements
      $('script, style, nav, header, footer, aside, .advertisement, .ads').remove();
      
      // Extract main content
      let content = '';
      
      // Try to find main content areas
      const contentSelectors = [
        '.content, .main-content, .article-content, .post-content',
        '.entry-content, .article-body, .news-content',
        'main, article, .container .row .col',
        'body'
      ];
      
      for (const selector of contentSelectors) {
        const element = $(selector).first();
        if (element.length && element.text().trim().length > 200) {
          content = element.text().trim();
          break;
        }
      }
      
      // If no specific content found, get all text
      if (!content) {
        content = $('body').text().trim();
      }
      
      // Clean up the content
      content = content
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();
      
      return content.substring(0, 10000); // Limit to 10k characters
    } catch (error) {
      logger.error(`[SCRAPER] Error fetching detailed content from ${url}:`, error);
      return '';
    }
  }
}

export const regulatoryDataScraper = new RegulatoryDataScraperService();
