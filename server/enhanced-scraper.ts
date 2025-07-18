import axios from 'axios';
import * as cheerio from 'cheerio';
import type { InsertMaterial } from '@shared/schema';
import { storage } from './storage.js';

// Enhanced stealth and data cleaning utilities
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
];

// Enhanced category fields with comprehensive specifications
const ENHANCED_CATEGORY_FIELDS = {
  tiles: [
    'Product Name', 'Brand / Manufacturer', 'Category', 'Material Type', 'PEI Rating',
    'DCOF Rating', 'Water Absorption', 'Finish', 'Color', 'Thickness', 'Edge Type',
    'Texture', 'Install Location', 'Dimensions', 'Price per SF', 'Product URL', 'Image URL'
  ],
  slabs: [
    'Product Name', 'Brand / Manufacturer', 'Category', 'Material Type', 'Color / Pattern',
    'Finish', 'Thickness', 'Slab Dimensions', 'Edge Type', 'Applications', 'Water Absorption',
    'Scratch / Etch Resistance', 'Heat Resistance', 'Country of Origin', 'Price per SF',
    'Product URL', 'Image URL'
  ],
  lvt: [
    'Product Name', 'Brand/Manufacturer', 'Category', 'Material Type', 'Wear Layer',
    'Core Type', 'Thickness', 'Width', 'Length', 'Waterproof', 'Installation Method',
    'Texture/Surface', 'Finish', 'Slip Resistance', 'Warranty', 'Product URL', 'Image URL'
  ],
  hardwood: [
    'Product Name', 'Brand/Manufacturer', 'Category', 'Species', 'Grade', 'Construction Type',
    'Finish', 'Width', 'Thickness', 'Length', 'Material Type', 'Janka Hardness',
    'Installation Method', 'Warranty', 'Product URL', 'Image URL'
  ],
  heat: [
    'Product Name', 'Brand/Manufacturer', 'Category', 'Type', 'Voltage', 'Coverage',
    'Features', 'Power', 'Applications', 'Warranty', 'Installation', 'Dimensions',
    'Product URL', 'Image URL'
  ],
  carpet: [
    'Product Name', 'Brand/Manufacturer', 'Category', 'Fiber Type', 'Pile Style',
    'Face Weight', 'Density', 'Backing', 'Stain Protection', 'Traffic Rating',
    'Width', 'Product URL', 'Image URL'
  ],
  thermostats: [
    'Product Name', 'Brand/Manufacturer', 'Category', 'Device Type', 'Voltage',
    'Load Capacity', 'Sensor Type', 'Display Type', 'Connectivity', 'Programmable',
    'Installation Type', 'Warranty', 'Product URL', 'Image URL'
  ]
};

export interface EnhancedScrapedProduct {
  name: string;
  brand: string;
  price: string;
  category: string;
  description: string;
  imageUrl: string;
  dimensions: string;
  specifications: Record<string, string>;
  sourceUrl: string;
  dataSheetUrl?: string;
  imageUrls?: string[];
}

export class EnhancedScraper {
  private delay = 2000; // 2 seconds between requests for better stealth
  private maxRetries = 3;
  private timeout = 20000; // 20 seconds timeout

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  private cleanText(text: string | null | undefined): string {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
  }

  private sanitizePrice(priceText: string): string {
    if (!priceText) return 'Contact for pricing';
    
    // Extract numeric price
    const match = priceText.match(/\d+\.?\d*/);
    if (match) {
      return match[0];
    }
    
    // Return original if no numeric match
    return priceText.includes('Contact') ? 'Contact for pricing' : priceText;
  }

  private extractBrandFromURL(url: string): string {
    const urlLower = url.toLowerCase();
    
    // Enhanced brand detection with more manufacturers
    const brandMap: Record<string, string> = {
      'daltile.com': 'Daltile',
      'msisurfaces.com': 'MSI',
      'arizonatile.com': 'Arizona Tile',
      'flooranddecor.com': 'Floor & Decor',
      'shaw.com': 'Shaw',
      'shawfloors.com': 'Shaw',
      'mohawk.com': 'Mohawk',
      'mohawkflooring.com': 'Mohawk',
      'marazzi.com': 'Marazzi',
      'emser.com': 'Emser',
      'bedrosians.com': 'Bedrosians',
      'floridatile.com': 'Florida Tile',
      'cambria.com': 'Cambria',
      'cambriausa.com': 'Cambria',
      'coretecfloors.com': 'COREtec',
      'warmup.com': 'Warmup',
      'warmlyyours.com': 'Warmly Yours',
      'suntouch.com': 'SunTouch',
      'schluter.com': 'Schluter',
      'thermosoft.com': 'ThermoSoft'
    };

    for (const [domain, brand] of Object.entries(brandMap)) {
      if (urlLower.includes(domain)) {
        return brand;
      }
    }
    
    // Extract from URL structure
    const match = url.match(/\/\/(?:www\.)?([^\.]+)/);
    if (match) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
    
    return 'Unknown';
  }

  private detectCategoryFromURL(url: string): string {
    const urlLower = url.toLowerCase();
    
    // Enhanced category detection with compound keywords
    const categoryMap: Record<string, string> = {
      'carpet-tile': 'carpet',
      'carpet-tiles': 'carpet',
      'vinyl-plank': 'lvt',
      'luxury-vinyl': 'lvt',
      'lvt': 'lvt',
      'lvp': 'lvt',
      'hardwood': 'hardwood',
      'engineered-wood': 'hardwood',
      'solid-wood': 'hardwood',
      'thermostat': 'thermostats',
      'heating-system': 'heat',
      'radiant-heat': 'heat',
      'floor-heating': 'heat',
      'underfloor-heating': 'heat',
      'slab': 'slabs',
      'countertop': 'slabs',
      'quartz': 'slabs',
      'granite': 'slabs',
      'marble': 'slabs',
      'tile': 'tiles',
      'ceramic': 'tiles',
      'porcelain': 'tiles',
      'carpet': 'carpet',
      'rug': 'carpet'
    };

    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (urlLower.includes(keyword)) {
        return category;
      }
    }
    
    return 'tiles'; // Default fallback
  }

  private extractSpecifications($: cheerio.CheerioAPI): Record<string, string> {
    const specs: Record<string, string> = {};
    
    // Method 1: Specification tables
    $('table.spec-table, table#specifications, table.product-specs, table.specifications, .specs-table').each((_, table) => {
      $(table).find('tr').each((_, row) => {
        const cells = $(row).find('td, th');
        if (cells.length >= 2) {
          const key = this.cleanText(cells.first().text());
          const value = this.cleanText(cells.last().text());
          if (key && value && !key.toLowerCase().includes('specification')) {
            specs[key] = value;
          }
        }
      });
    });

    // Method 2: Definition lists
    $('dl.specs, dl.specifications, .spec-list dl').each((_, dl) => {
      $(dl).find('dt').each((_, dt) => {
        const key = this.cleanText($(dt).text());
        const value = this.cleanText($(dt).next('dd').text());
        if (key && value) {
          specs[key] = value;
        }
      });
    });

    // Method 3: Key-value pairs
    $('.spec-item, .specification-item, .product-spec').each((_, item) => {
      const $item = $(item);
      const label = $item.find('.spec-label, .label, .key').first();
      const value = $item.find('.spec-value, .value, .val').first();
      
      if (label.length && value.length) {
        const key = this.cleanText(label.text().replace(':', ''));
        const val = this.cleanText(value.text());
        if (key && val) {
          specs[key] = val;
        }
      }
    });

    // Method 4: Structured data extraction
    $('[itemprop]').each((_, elem) => {
      const $elem = $(elem);
      const prop = $elem.attr('itemprop');
      const value = this.cleanText($elem.text() || $elem.attr('content') || '');
      if (prop && value) {
        specs[prop] = value;
      }
    });

    return specs;
  }

  private extractImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const images: string[] = [];
    const imageSelectors = [
      'img.product-image',
      '.product-gallery img',
      'img[src*="product"]',
      'img[src*="tile"]',
      'img[data-src*="product"]',
      '.hero-image img',
      '.main-image img'
    ];

    imageSelectors.forEach(selector => {
      $(selector).each((_, img) => {
        const src = $(img).attr('src') || $(img).attr('data-src');
        if (src && !src.includes('placeholder') && !src.includes('logo')) {
          const absoluteUrl = new URL(src, baseUrl).toString();
          if (!images.includes(absoluteUrl)) {
            images.push(absoluteUrl);
          }
        }
      });
    });

    return images;
  }

  private findDataSheetUrl($: cheerio.CheerioAPI, baseUrl: string): string | undefined {
    const datasheetSelectors = [
      'a[href*="datasheet"]',
      'a[href*="spec"]',
      'a[href*="technical"]',
      'a:contains("Data Sheet")',
      'a:contains("Technical Specs")',
      'a:contains("Specifications")'
    ];

    for (const selector of datasheetSelectors) {
      const link = $(selector).first();
      if (link.length) {
        const href = link.attr('href');
        if (href) {
          return new URL(href, baseUrl).toString();
        }
      }
    }

    return undefined;
  }

  async scrapeProduct(url: string): Promise<EnhancedScrapedProduct | null> {
    console.log(`🔍 Enhanced scraping: ${url}`);
    
    let retries = 0;
    while (retries < this.maxRetries) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          timeout: this.timeout
        });

        const $ = cheerio.load(response.data);
        
        // Extract basic product information
        const name = this.cleanText(
          $('h1.product-title, h1[itemprop="name"], h1.product-name, .product-title h1').first().text()
        ) || 'Unknown Product';

        const brand = this.extractBrandFromURL(url);
        const category = this.detectCategoryFromURL(url);
        
        // Extract price
        const priceElement = $('.product-price, .price, [itemprop="price"], .price-current').first();
        const rawPrice = this.cleanText(priceElement.text());
        const price = this.sanitizePrice(rawPrice);

        // Extract description
        const description = this.cleanText(
          $('.product-description, .description, [itemprop="description"]').first().text()
        ) || `${brand} ${name}`;

        // Extract specifications
        const specifications = this.extractSpecifications($);
        
        // Add basic specifications
        specifications['Product Name'] = name;
        specifications['Brand / Manufacturer'] = brand;
        specifications['Category'] = category;
        specifications['Price'] = price;
        specifications['Product URL'] = url;

        // Extract images
        const imageUrls = this.extractImages($, url);
        const imageUrl = imageUrls.length > 0 ? imageUrls[0] : '';
        specifications['Image URL'] = imageUrl;

        // Extract dimensions
        const dimensions = specifications['Dimensions'] || specifications['Size'] || 
                         specifications['Dimension'] || '12" x 12"';

        // Find data sheet URL
        const dataSheetUrl = this.findDataSheetUrl($, url);

        console.log(`✅ Successfully scraped: ${name} by ${brand}`);
        console.log(`📊 Extracted ${Object.keys(specifications).length} specifications`);

        return {
          name,
          brand,
          price,
          category,
          description,
          imageUrl,
          dimensions,
          specifications,
          sourceUrl: url,
          dataSheetUrl,
          imageUrls
        };

      } catch (error) {
        retries++;
        console.log(`❌ Attempt ${retries} failed for ${url}: ${error}`);
        
        if (retries < this.maxRetries) {
          console.log(`🔄 Retrying in ${this.delay}ms...`);
          await this.sleep(this.delay);
        }
      }
    }

    console.log(`💥 Failed to scrape ${url} after ${this.maxRetries} attempts`);
    return null;
  }

  async scrapeAndSave(url: string): Promise<{ success: boolean; product?: any; message: string }> {
    try {
      const scrapedProduct = await this.scrapeProduct(url);
      
      if (!scrapedProduct) {
        return {
          success: false,
          message: 'Failed to scrape product after multiple attempts'
        };
      }

      // Convert to InsertMaterial format
      const material: InsertMaterial = {
        name: scrapedProduct.name,
        brand: scrapedProduct.brand,
        price: scrapedProduct.price,
        category: scrapedProduct.category,
        description: scrapedProduct.description,
        imageUrl: scrapedProduct.imageUrl,
        dimensions: scrapedProduct.dimensions,
        specifications: scrapedProduct.specifications,
        sourceUrl: scrapedProduct.sourceUrl,
        inStock: true
      };

      // Save to storage
      const savedProduct = await storage.createMaterial(material);
      
      return {
        success: true,
        product: savedProduct,
        message: 'Product scraped and saved successfully with enhanced specifications'
      };

    } catch (error) {
      console.error('Error in scrapeAndSave:', error);
      return {
        success: false,
        message: `Error during scraping: ${error}`
      };
    }
  }
}

export const enhancedScraper = new EnhancedScraper();