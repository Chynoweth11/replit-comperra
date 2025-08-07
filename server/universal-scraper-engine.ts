import axios from 'axios';
import * as cheerio from 'cheerio';
import { EnhancedScraper } from './enhanced-scraper';
import { SimulationScraper } from './simulation-scraper';

export interface UniversalScrapingResult {
  success: boolean;
  product?: any;
  error?: string;
  method: 'enhanced' | 'simulation' | 'fallback';
  extractionStats: {
    specCount: number;
    imageCount: number;
    processingTime: number;
  };
}

export class UniversalScraperEngine {
  private enhancedScraper: EnhancedScraper;
  private simulationScraper: SimulationScraper;
  private processedUrls: Set<string> = new Set();
  
  // Comprehensive brand and domain mappings for thousands of manufacturers
  private supportedDomains = new Set([
    // Tile & Stone Manufacturers
    'daltile.com', 'msisurfaces.com', 'arizonatile.com', 'floridatile.com',
    'marazziusa.com', 'emser.com', 'bedrosians.com', 'akdo.com',
    'stonepeak.com', 'atlas-concorde.com', 'porcelanosa-usa.com',
    'crossvilleinc.com', 'americanolean.com', 'ragno.com',
    'versaceceramics.com', 'refin.com', 'iris-ceramica.com',
    'lafaenza.com', 'caesar.it', 'granitifico.com',
    
    // Natural Stone & Slab Manufacturers  
    'caesarstone.com', 'silestone.com', 'cambriaquartz.com',
    'hanwhasurfaces.com', 'cosentino.com', 'quartzsuperstore.com',
    'pentstoneworks.com', 'angolagranite.com', 'rckgranite.com',
    'universalmarble.com', 'beltrami-natural-stone.com',
    'mgsi.net', 'turkishmarble.com', 'marbleandgranite.com',
    
    // Vinyl, LVT & Hardwood Manufacturers
    'shaw.com', 'mohawkflooring.com', 'mannington.com',
    'coretec.com', 'karndean.com', 'luxuryvinyltile.com',
    'tarkett.com', 'armstrong.com', 'flexitec.com',
    'adura.com', 'southwind.com', 'hallmark-floors.com',
    'beaulieu.com', 'duraceramic.com', 'ivc-us.com',
    'reward-hardwood.com', 'mercier-wood-flooring.com',
    'mirage-floors.com', 'lauzon.com', 'indusparquet.com',
    
    // Carpet Manufacturers
    'interface.com', 'mohawkgroup.com', 'shawcontract.com',
    'carpets.com', 'stainmaster.com', 'dreamweaver.com',
    'royalty-carpet.com', 'phenix.com', 'gulistan.com',
    'masland.com', 'beaulieufibres.com', 'shawfloors.com',
    
    // Heating & Thermostat Manufacturers
    'warmup.com', 'nuheat.com', 'suntouch.com', 'schluter.com',
    'honeywell.com', 'ecobee.com', 'nest.com', 'emerson.com',
    'king-electric.com', 'stelpro.com', 'cadet.com',
    'marley-engineered.com', 'fahrenheat.com', 'aube.com'
  ]);

  constructor() {
    this.enhancedScraper = new EnhancedScraper();
    this.simulationScraper = new SimulationScraper();
  }

  /**
   * Universal scraping method that handles thousands of URLs across all categories
   */
  async scrapeUniversal(url: string): Promise<UniversalScrapingResult> {
    const startTime = Date.now();
    
    try {
      // Validate URL and domain
      if (!this.isValidUrl(url)) {
        return {
          success: false,
          error: 'Invalid URL format',
          method: 'fallback',
          extractionStats: { specCount: 0, imageCount: 0, processingTime: Date.now() - startTime }
        };
      }

      // Check if domain is supported
      const domain = new URL(url).hostname.replace('www.', '');
      if (!this.supportedDomains.has(domain)) {
        console.log(`⚠️  Domain ${domain} not in optimized list, attempting universal scraping...`);
      }

      // Try enhanced scraper first
      try {
        const enhancedResult = await this.enhancedScraper.scrapeProduct(url);
        if (enhancedResult) {
          const specCount = Object.keys(enhancedResult.specifications || {}).length;
          return {
            success: true,
            product: enhancedResult,
            method: 'enhanced',
            extractionStats: {
              specCount,
              imageCount: enhancedResult.imageUrl ? 1 : 0,
              processingTime: Date.now() - startTime
            }
          };
        }
      } catch (enhancedError) {
        console.log(`🔄 Enhanced scraper failed for ${url}: ${enhancedError}`);
      }

      // Fallback to simulation scraper
      const simulationResults = await this.simulationScraper.scrapeRealProductFromURL(url);
      const simulationResult = simulationResults && simulationResults.length > 0 ? simulationResults[0] : null;
      if (simulationResult) {
        const specCount = Object.keys(simulationResult.specifications || {}).length;
        return {
          success: true,
          product: simulationResult,
          method: 'simulation',
          extractionStats: {
            specCount,
            imageCount: simulationResult.imageUrl ? 1 : 0,
            processingTime: Date.now() - startTime
          }
        };
      }

      return {
        success: false,
        error: 'All scraping methods failed',
        method: 'fallback',
        extractionStats: { specCount: 0, imageCount: 0, processingTime: Date.now() - startTime }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'fallback',
        extractionStats: { specCount: 0, imageCount: 0, processingTime: Date.now() - startTime }
      };
    }
  }

  /**
   * Bulk scraping method for processing hundreds/thousands of URLs
   */
  async scrapeBulk(urls: string[], maxConcurrent: number = 5): Promise<UniversalScrapingResult[]> {
    const results: UniversalScrapingResult[] = [];
    const chunks = this.chunkArray(urls, maxConcurrent);
    
    console.log(`🚀 Starting bulk scraping of ${urls.length} URLs in chunks of ${maxConcurrent}`);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`📦 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} URLs)`);
      
      const chunkPromises = chunk.map(url => this.scrapeUniversal(url));
      const chunkResults = await Promise.allSettled(chunkPromises);
      
      chunkResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: `Promise rejected: ${result.reason}`,
            method: 'fallback',
            extractionStats: { specCount: 0, imageCount: 0, processingTime: 0 }
          });
        }
      });
      
      // Add delay between chunks to be respectful to servers
      if (i < chunks.length - 1) {
        await this.delay(1000);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const avgSpecs = results.filter(r => r.success).reduce((sum, r) => sum + r.extractionStats.specCount, 0) / successCount;
    
    console.log(`✅ Bulk scraping complete: ${successCount}/${urls.length} successful (${avgSpecs.toFixed(1)} avg specs)`);
    
    return results;
  }

  /**
   * Enhanced URL validation supporting all manufacturer domains
   */
  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Must be HTTP/HTTPS
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false;
      }
      
      // Must have a valid hostname
      if (!parsedUrl.hostname || parsedUrl.hostname.length < 4) {
        return false;
      }
      
      // Block known problematic domains
      const blockedDomains = ['localhost', '127.0.0.1', 'example.com', 'test.com'];
      if (blockedDomains.some(domain => parsedUrl.hostname.includes(domain))) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add domain to supported list dynamically
   */
  addSupportedDomain(domain: string): void {
    this.supportedDomains.add(domain.replace('www.', ''));
    console.log(`➕ Added domain to supported list: ${domain}`);
  }

  /**
   * Get comprehensive statistics about scraping capabilities
   */
  getScrapingStats(): {
    supportedDomains: number;
    processedUrls: number;
    categories: string[];
  } {
    return {
      supportedDomains: this.supportedDomains.size,
      processedUrls: this.processedUrls.size,
      categories: ['tiles', 'slabs', 'lvt', 'hardwood', 'carpet', 'heat', 'thermostats']
    };
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}