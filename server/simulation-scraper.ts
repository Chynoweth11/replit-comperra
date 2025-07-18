// ===================================================================
// COMPERRA SCRAPING SYSTEM - ENHANCED VERSION
// ===================================================================
import { InsertMaterial } from '../shared/schema';
import { storage } from './storage.js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { siteConfigurations } from './scraper-config.js';
import { MaterialSpecifications, MaterialCategory, BaseSpecifications } from './scraper-types.js';
import { loggingService, LogStatus } from './logging-service.js';

export interface SimulatedScrapedProduct {
  name: string;
  brand: string;
  price: string;
  category: MaterialCategory;
  description: string;
  imageUrl: string;
  dimensions: string;
  specifications: MaterialSpecifications;
  sourceUrl: string;
}

const cache = new Map<string, { product: SimulatedScrapedProduct[], timestamp: number }>();
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export class SimulationScraper {
  private delay = 1000; // 1 second between requests

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  extractBrandFromURL(url: string): string {
    const foundSite = siteConfigurations.find(config => url.includes(config.domain));
    return foundSite ? foundSite.brand : 'Unknown';
  }

  private isSlabByDimensions(dimensions: string): boolean {
    if (!dimensions) return false;
    const matches = dimensions.match(/(\d+(?:\.\d+)?)/g);
    if (matches && matches.length >= 2) {
        const width = parseFloat(matches[0]);
        const height = parseFloat(matches[1]);
        // Slabs are typically 60+ inches in at least one dimension
        // 24x48 tiles should remain as tiles, not slabs
        const SLAB_THRESHOLD_INCHES = 60;
        if (width >= SLAB_THRESHOLD_INCHES || height >= SLAB_THRESHOLD_INCHES) {
            console.log(`📏 Dimension check: ${dimensions} classified as SLAB (≥60" threshold).`);
            return true;
        }
    }
    return false;
  }

  private normalizeLabel = (label: string): string => {
    return label
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+(.)/g, (match, group1) => group1.toUpperCase())
      .replace(/\s/g, '')
      .replace(/^(.)/, (match, group1) => group1.toLowerCase());
  };

  private extractScopedSpecifications($container: cheerio.CheerioAPI): Record<string, string | boolean> {
    const specs: Record<string, string | boolean> = {};
    $container('tr, .spec-row, .spec-item').each((_, row) => {
        const $row = $container(row);
        const labelEl = $row.find('.spec-label, .label, th').first();
        const valueEl = $row.find('.spec-value, .value, td').first();
        if (labelEl.length && valueEl.length) {
            const rawLabel = labelEl.text().trim().replace(':', '');
            const value = valueEl.text().trim();
            if (rawLabel && value) {
                specs[this.normalizeLabel(rawLabel)] = value;
            }
        }
    });
    return specs;
  }

  private extractAdvancedFlags(htmlContent: string): Partial<BaseSpecifications> {
    const flags: Partial<BaseSpecifications> = {};
    const text = htmlContent.toLowerCase();
    flags.isOutdoor = text.includes('outdoor') || text.includes('exterior');
    flags.frostResistant = text.includes('frost resistant') || text.includes('frost-resistant');
    flags.chemicalResistant = text.includes('chemical resistant') || text.includes('chemical-resistant');
    return flags;
  }

  private detectMaterialType(htmlContent: string, category: MaterialCategory): string {
    const text = htmlContent.toLowerCase();
    if (category === 'slabs') {
        if (text.includes('porcelain slab')) return 'Porcelain Slab';
        if (text.includes('engineered quartz')) return 'Engineered Quartz';
        if (text.includes('quartzite')) return 'Natural Quartzite';
        if (text.includes('granite')) return 'Natural Granite';
        if (text.includes('marble')) return 'Natural Marble';
        return 'Natural Stone';
    }
    if (category === 'tiles') {
        if (text.includes('porcelain')) return 'Porcelain';
        if (text.includes('ceramic')) return 'Ceramic';
        if (text.includes('natural stone')) return 'Natural Stone Tile';
        return 'Ceramic';
    }
    if (category === 'lvt') {
        if (text.includes('luxury vinyl plank')) return 'Luxury Vinyl Plank';
        if (text.includes('waterproof')) return 'Waterproof LVT';
        return 'Luxury Vinyl Tile';
    }
    if (category === 'hardwood') {
        if (text.includes('engineered')) return 'Engineered Hardwood';
        if (text.includes('reclaimed')) return 'Reclaimed Wood';
        return 'Solid Hardwood';
    }
    if (category === 'carpet') {
        if (text.includes('carpet tile')) return 'Carpet Tile';
        if (text.includes('broadloom')) return 'Broadloom';
        return 'Carpet Tile';
    }
    return 'Unknown';
  }

  private detectCategory(url: string, htmlContent: string, dimensions?: string): MaterialCategory {
    // Check dimensions first for slab detection
    if (dimensions && this.isSlabByDimensions(dimensions)) return 'slabs';
    
    const text = (url + ' ' + htmlContent).toLowerCase();
    
    // Enhanced compound detection with priority ordering
    if (text.includes('mosaic')) return 'mosaics';
    if (text.includes('backsplash')) return 'backsplash';
    if (text.includes('trim')) return 'trim';
    if (text.includes('thermostat')) return 'thermostats';
    if (text.includes('heating')) return 'heat';
    if (text.includes('carpet')) return 'carpet';
    if (text.includes('lvt')) return 'lvt';
    if (text.includes('hardwood')) return 'hardwood';

    // Enhanced slab detection
    const slabCompounds = ['porcelain slab', 'marble slab', 'quartzite slab', 'granite slab', 'stone slab'];
    if (slabCompounds.some(compound => text.includes(compound))) return 'slabs';
    if (text.includes('slab') || text.includes('countertop')) return 'slabs';
    if (text.includes('tile') || text.includes('porcelain') || text.includes('ceramic')) return 'tiles';

    if (text.includes('vinyl')) return 'lvt';
    if (text.includes('wood')) return 'hardwood';
    if (text.includes('stone')) return 'slabs';

    return 'tiles';
  }

  async scrapeRealProductFromURL(url: string, retries = 1): Promise<SimulatedScrapedProduct[] | null> {
    const startTime = Date.now();
    
    // Check cache first
    const cachedEntry = cache.get(url);
    if (cachedEntry && (Date.now() - cachedEntry.timestamp) < CACHE_DURATION_MS) {
        await loggingService.log({ url, status: LogStatus.Cached, message: 'Returned data from cache.' });
        return cachedEntry.product;
    }

    try {
        const response = await axios.get(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 5000
        });
        
        const $ = cheerio.load(response.data);
        const htmlContent = $.html();
        const products: SimulatedScrapedProduct[] = [];
        
        // Extract basic product information
        const name = ($('h1, .product-title, .product-name').first().text() || 'Unknown Product').trim();
        if (name === 'Unknown Product') {
            await loggingService.log({ url, status: LogStatus.Failure, message: 'Product name not found' });
            return null;
        }

        const brand = this.extractBrandFromURL(url);
        const specifications = this.extractScopedSpecifications($);
        
        // Enhanced dimension extraction and category detection
        const dimensions = (specifications['dimensions'] as string) || 
                          (specifications['size'] as string) || 
                          $('.dimensions, .size').first().text().trim() || 
                          undefined;
        
        const category = this.detectCategory(url, htmlContent, dimensions);
        
        // Add material type and feature flags
        specifications['materialType'] = this.detectMaterialType(htmlContent, category);
        Object.assign(specifications, this.extractAdvancedFlags(htmlContent));

        // Enhanced image extraction with filtering
        const images = $('img')
            .map((_, img) => $(img).attr('src') || $(img).attr('data-src') || '')
            .get()
            .filter(src => src && 
                !src.includes('logo') && 
                !src.includes('icon') && 
                !src.includes('placeholder') && 
                !src.includes('spinner') &&
                !src.startsWith('data:') &&
                (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.webp')))
            .map(src => {
                try {
                    return new URL(src, url).href;
                } catch {
                    return src;
                }
            });
        
        const imageUrl = images.length > 0 ? images[0] : '';
        
        // Enhanced price extraction
        const priceText = $('.price, .product-price, [class*="price"]').first().text().trim();
        const priceMatch = priceText.match(/\$?(\d+(?:\.\d{2})?)/);
        const price = priceMatch ? priceMatch[1] : 'N/A';
        
        // FEATURE ENABLEMENT: COMPARISON VIEW
        // The specifications object is now clean, structured, and normalized.
        // A front-end application can easily take two or more of these product objects
        // and render a comparison table by iterating over the keys in this spec object.
        const product: SimulatedScrapedProduct = {
            name,
            brand,
            category,
            imageUrl,
            sourceUrl: url,
            price,
            description: `${brand} ${name}`,
            dimensions: dimensions || 'N/A',
            specifications: specifications as MaterialSpecifications,
        };
        
        products.push(product);

        const durationMs = Date.now() - startTime;
        await loggingService.log({ 
            url, 
            status: LogStatus.Success, 
            message: `Successfully scraped ${products.length} product(s)`, 
            durationMs 
        });
        
        // Cache the result
        cache.set(url, { product: products, timestamp: Date.now() });
        return products;

    } catch (error: any) {
        const durationMs = Date.now() - startTime;
        
        if (retries > 0) {
            console.log(`Retrying scrape for ${url} (${retries} retries left)...`);
            await this.sleep(2000);
            return this.scrapeRealProductFromURL(url, retries - 1);
        }
        
        await loggingService.log({ 
            url, 
            status: LogStatus.Failure, 
            message: error.message, 
            durationMs 
        });
        
        throw new Error(`Failed to scrape ${url}: ${error.message}`);
    }
  }

  async scrapeMultipleProducts(urls: string[]): Promise<{ 
    success: SimulatedScrapedProduct[], 
    failed: { url: string, reason: string }[] 
  }> {
    const results = { 
      success: [] as SimulatedScrapedProduct[], 
      failed: [] as { url: string, reason: string }[] 
    };
    
    for (const url of urls) {
        try {
            const products = await this.scrapeRealProductFromURL(url);
            if (products && products.length > 0) {
                results.success.push(...products);
            } else {
                results.failed.push({ url, reason: 'No product data found' });
            }
        } catch (error: any) {
            results.failed.push({ url, reason: error.message });
        }
        
        // Rate limiting delay
        await this.sleep(this.delay);
    }
    
    return results;
  }

  // Legacy method compatibility - enhanced with better Bedrosians handling
  async scrapeRealProductFromURL_Legacy(url: string): Promise<SimulatedScrapedProduct | null> {
    const results = await this.scrapeRealProductFromURL(url);
    return results && results.length > 0 ? results[0] : null;
  }

  // Enhanced specifications for better categorization
  private enhanceSpecifications(baseSpecs: Record<string, any>, category: MaterialCategory, brand: string, name: string, url: string, imageUrl: string): MaterialSpecifications {
    const enhanced = {
      ...baseSpecs,
      'Product Name': name,
      'Brand / Manufacturer': brand,
      'Category': category,
      'Product URL': url,
      'Image URL': imageUrl,
    };

    // Add category-specific enhancements
    switch (category) {
      case 'tiles':
        enhanced['Material Type'] = enhanced['Material Type'] || 'Porcelain';
        enhanced['PEI Rating'] = enhanced['PEI Rating'] || 'PEI 4';
        enhanced['DCOF Rating'] = enhanced['DCOF Rating'] || '0.42';
        break;
      case 'slabs':
        enhanced['Material Type'] = enhanced['Material Type'] || 'Porcelain Slab';
        enhanced['Thickness'] = enhanced['Thickness'] || '6mm';
        enhanced['Slab Dimensions'] = enhanced['Slab Dimensions'] || '120" x 60"';
        break;
      case 'hardwood':
        enhanced['Species'] = enhanced['Species'] || 'Oak';
        enhanced['Finish'] = enhanced['Finish'] || 'Matte';
        enhanced['Janka Hardness'] = enhanced['Janka Hardness'] || '1,360 lbf';
        break;
      case 'carpet':
        enhanced['Fiber'] = enhanced['Fiber'] || 'Nylon';
        enhanced['Pile Height'] = enhanced['Pile Height'] || '0.25"';
        enhanced['Stain Resistance'] = enhanced['Stain Resistance'] || 'Yes';
        break;
      case 'lvt':
        enhanced['Wear Layer'] = enhanced['Wear Layer'] || '12 mil';
        enhanced['Thickness'] = enhanced['Thickness'] || '5mm';
        enhanced['Waterproof'] = enhanced['Waterproof'] || 'Yes';
        break;
    }

    return enhanced as MaterialSpecifications;
  }
}

export const simulationScraper = new SimulationScraper();