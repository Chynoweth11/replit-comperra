import axios from 'axios';
import * as cheerio from 'cheerio';
import type { InsertMaterial } from '@shared/schema';

export interface ScrapedProduct {
  name: string;
  brand: string;
  price: string;
  category: string;
  description: string;
  imageUrl: string;
  dimensions: string;
  specifications: any;
  sourceUrl: string;
}

// Enhanced spec templates for all six categories
const specTemplates = {
  tiles: ["Brand", "Price per SF", "Dimensions", "PEI Rating", "DCOF / Slip Rating", "Water Absorption", "Finish", "Material Type", "Edge Type", "Install Location", "Color", "Texture", "Product URL"],
  slabs: ["Brand", "Price per SF", "Size", "Thickness", "Finish", "Stone Type", "Pattern/Vein", "Edge Type", "Country of Origin", "Product URL"],
  lvt: ["Brand", "Price per SF", "Size", "Wear Layer", "Type (SPC/WPC/LVT)", "Underlayment", "Water Resistance", "Install Method", "Texture", "Color", "Product URL"],
  hardwood: ["Brand", "Price per SF", "Size", "Wood Species", "Janka Rating", "Finish", "Construction Type", "Installation Method", "Warranty", "Product URL"],
  heat: ["Brand", "Type", "Voltage", "Coverage Area (SF)", "Programmable Features", "Sensor Type", "Thermostat Included", "Install Location", "Max Temperature", "Product URL"],
  carpet: ["Brand", "Price per SF", "Fiber Type", "Pile Height", "Backing", "Face Weight", "Stain Resistance", "Color Options", "Product URL"]
};

export class ProductScraper {
  private delay = 1000; // 1 second between requests

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  assignCategoryFromURL(url: string): string {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('tile') || urlLower.includes('ceramic') || urlLower.includes('porcelain')) return 'tiles';
    if (urlLower.includes('slab') || urlLower.includes('quartz') || urlLower.includes('marble') || urlLower.includes('granite')) return 'slabs';
    if (urlLower.includes('lvt') || urlLower.includes('vinyl') || urlLower.includes('luxury-vinyl')) return 'lvt';
    if (urlLower.includes('hardwood') || urlLower.includes('wood-flooring') || urlLower.includes('engineered')) return 'hardwood';
    if (urlLower.includes('heating') || urlLower.includes('radiant') || urlLower.includes('thermostat')) return 'heat';
    if (urlLower.includes('carpet') || urlLower.includes('rug')) return 'carpet';
    return 'tiles'; // default
  }

  extractBrandFromURL(url: string): string {
    if (url.includes('daltile.com')) return 'Daltile';
    if (url.includes('msisurfaces.com')) return 'MSI';
    if (url.includes('marazzi.com')) return 'Marazzi';
    if (url.includes('arizonatile.com')) return 'Arizona Tile';
    if (url.includes('floridatile.com')) return 'Florida Tile';
    if (url.includes('akdo.com')) return 'AKDO';
    if (url.includes('shawfloors.com')) return 'Shaw';
    if (url.includes('mohawkflooring.com')) return 'Mohawk';
    if (url.includes('flor.com')) return 'Flor';
    if (url.includes('cambriausa.com')) return 'Cambria';
    if (url.includes('caesarstoneus.com')) return 'Caesarstone';
    if (url.includes('silestone.com')) return 'Silestone';
    return 'Unknown';
  }

  async scrapeDaltileProduct(url: string, category: string): Promise<ScrapedProduct | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Enhanced name extraction
      let name = $('h1.product-title, h1.pdp-product-name, .product-name h1, h1').first().text().trim() ||
                $('.product-title, .pdp-title').text().trim() ||
                $('title').text().split('|')[0].trim() ||
                'Product Name Not Found';
      
      name = name.replace(/\s+/g, ' ').trim();
      
      // Enhanced description extraction
      const description = $('.product-description, .description, .product-overview, .pdp-description')
        .first().text().trim().substring(0, 500) || '';
      
      // Enhanced image extraction
      let imageUrl = $('img.product-image, .product-photo img, .hero-image img, .pdp-image img, img[alt*="product"]')
        .first().attr('src') || $('img').first().attr('src') || '';
      
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      
      // Category-specific specification extraction using templates
      const specs: any = {};
      const fields = specTemplates[category as keyof typeof specTemplates] || [];
      
      // Extract specifications from tables and structured data
      $('.specification-item, .spec-row, .product-specs tr, .specs-table tr, .technical-specs tr').each((_, elem) => {
        const key = $(elem).find('.spec-label, .label, td:first-child, th').text().trim();
        const value = $(elem).find('.spec-value, .value, td:last-child').text().trim();
        if (key && value && key !== value) {
          // Map to template fields
          fields.forEach(field => {
            if (key.toLowerCase().includes(field.toLowerCase().split(' ')[0]) || 
                field.toLowerCase().includes(key.toLowerCase())) {
              specs[field] = value;
            }
          });
        }
      });

      // Category-specific field extraction
      const pageText = $('body').text();
      
      if (category === 'tiles') {
        if (!specs['PEI Rating']) {
          const peiMatch = pageText.match(/PEI[\s:]?(\d+)/i);
          if (peiMatch) specs['PEI Rating'] = peiMatch[1];
        }
        
        if (!specs['DCOF / Slip Rating']) {
          const dcofMatch = pageText.match(/DCOF[\s:]?([\d.]+)/i);
          if (dcofMatch) specs['DCOF / Slip Rating'] = dcofMatch[1];
        }
        
        if (!specs['Water Absorption']) {
          const waterMatch = pageText.match(/water\s+absorption[\s:]*([\d.]+%?)/i);
          if (waterMatch) specs['Water Absorption'] = waterMatch[1];
        }
      }

      // Extract dimensions
      let dimensions = $('.size, .dimensions, .product-size, .tile-size').text().trim() || '';
      if (!dimensions) {
        const dimMatch = pageText.match(/(\d+["']?\s*[xX×]\s*\d+["']?)/);
        if (dimMatch) dimensions = dimMatch[1];
      }
      specs['Dimensions'] = dimensions;
      
      // Extract price
      let price = '0.00';
      const priceSelectors = [
        '.price-current, .price .amount, .product-price .price',
        '[data-price], .price-value, .cost, .retail-price',
        '.price-per-sqft, .price-display, .pdp-price'
      ];
      
      for (const selector of priceSelectors) {
        const priceElement = $(selector);
        if (priceElement.length) {
          const priceText = priceElement.text().trim();
          const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
          if (priceMatch) {
            price = priceMatch[1].replace(',', '');
            break;
          }
        }
      }

      // Add required fields
      specs['Brand'] = 'Daltile';
      specs['Price per SF'] = price;
      specs['Product URL'] = url;

      return {
        name,
        brand: 'Daltile',
        price,
        category,
        description,
        imageUrl,
        dimensions,
        specifications: specs,
        sourceUrl: url
      };
    } catch (error) {
      console.error(`Error scraping Daltile product ${url}:`, error);
      return null;
    }
  }

  async scrapeMSIProduct(url: string, category: string): Promise<ScrapedProduct | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      const name = $('h1.product-name, .product-title, h1').first().text().trim();
      const description = $('.product-overview, .product-description').text().trim();
      let imageUrl = $('.product-gallery img, .hero-image img').first().attr('src') || '';
      
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      
      // Category-specific specification extraction using templates
      const specs: any = {};
      const fields = specTemplates[category as keyof typeof specTemplates] || [];
      
      // Extract from specification tables
      $('.product-specs .spec-item, .specifications tr, .specs tr').each((_, elem) => {
        const key = $(elem).find('td:first-child, .spec-name, .label').text().trim();
        const value = $(elem).find('td:last-child, .spec-value, .value').text().trim();
        if (key && value) {
          // Map to template fields
          fields.forEach(field => {
            if (key.toLowerCase().includes(field.toLowerCase().split(' ')[0]) || 
                field.toLowerCase().includes(key.toLowerCase())) {
              specs[field] = value;
            }
          });
        }
      });

      // Extract dimensions and other key specs
      let dimensions = $('.size-info, .dimensions, .size').text().trim() || '';
      if (!dimensions) {
        const pageText = $('body').text();
        const dimMatch = pageText.match(/(\d+["']?\s*[xX×]\s*\d+["']?)/);
        if (dimMatch) dimensions = dimMatch[1];
      }
      specs['Dimensions'] = dimensions;
      specs['Size'] = dimensions;

      // Extract price
      const priceText = $('.price-display, .price, .cost').text().trim();
      const price = priceText.match(/[\d.]+/)?.[0] || '0.00';

      // Add required fields
      specs['Brand'] = 'MSI';
      specs['Price per SF'] = price;
      specs['Product URL'] = url;

      return {
        name,
        brand: 'MSI',
        price,
        category,
        description,
        imageUrl,
        dimensions,
        specifications: specs,
        sourceUrl: url
      };
    } catch (error) {
      console.error(`Error scraping MSI product ${url}:`, error);
      return null;
    }
  }

  async scrapeGenericProduct(url: string, category: string): Promise<ScrapedProduct | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Enhanced name extraction
      let name = $('h1.product-title, h1.product-name, .product-title h1, h1').first().text().trim() ||
                $('.product-title, .product-name, .pdp-title, .item-title').text().trim() ||
                $('title').text().split('|')[0].split('-')[0].trim() ||
                'Product Name Not Found';
      
      name = name.replace(/\s+/g, ' ').trim();
      
      const description = $('.product-description, .description, .overview, .product-details, .about-product')
        .first().text().trim().substring(0, 500) || '';
      
      let imageUrl = $('.product-image img, .hero-image img, .gallery img, .main-image img, img[alt*="product"]')
        .first().attr('src') || $('img').first().attr('src') || '';
      
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
        const baseUrl = new URL(url).origin;
        imageUrl = baseUrl + imageUrl;
      }
      
      // Category-specific specification extraction using templates
      const specs: any = {};
      const fields = specTemplates[category as keyof typeof specTemplates] || [];
      
      // Extract from tables and specification sections
      $('table, .specs, .product-details, .specifications').find('tr, li, .spec-item').each((_, elem) => {
        const text = $(elem).text();
        const cells = $(elem).find('td');
        
        if (cells.length >= 2) {
          const key = $(cells[0]).text().trim();
          const value = $(cells[1]).text().trim();
          if (key && value) {
            fields.forEach(field => {
              if (key.toLowerCase().includes(field.toLowerCase().split(' ')[0]) || 
                  field.toLowerCase().includes(key.toLowerCase())) {
                specs[field] = value;
              }
            });
          }
        } else {
          // Handle text-based specs
          fields.forEach(field => {
            if (text.toLowerCase().includes(field.toLowerCase().split(' ')[0])) {
              const parts = text.split(':');
              if (parts.length > 1) {
                const value = parts[1].trim();
                if (value) specs[field] = value;
              }
            }
          });
        }
      });

      // Category-specific field extraction from page content
      const pageText = $('body').text();
      
      if (category === 'tiles') {
        if (!specs['PEI Rating']) {
          const peiMatch = pageText.match(/PEI[\s:]?(\d+)/i);
          if (peiMatch) specs['PEI Rating'] = peiMatch[1];
        }
        
        if (!specs['DCOF / Slip Rating']) {
          const dcofMatch = pageText.match(/DCOF[\s:]?([\d.]+)/i);
          if (dcofMatch) specs['DCOF / Slip Rating'] = dcofMatch[1];
        }
        
        if (!specs['Water Absorption']) {
          const waterMatch = pageText.match(/water\s+absorption[\s:]*([\d.]+%?)/i);
          if (waterMatch) specs['Water Absorption'] = waterMatch[1];
        }
      }

      // Extract dimensions
      let dimensions = $('.size, .dimensions, .product-size, .tile-size').text().trim() || '';
      if (!dimensions) {
        const dimMatch = pageText.match(/(\d+["']?\s*[xX×]\s*\d+["']?(?:\s*[xX×]\s*\d+["']?)?)/);
        if (dimMatch) dimensions = dimMatch[1];
      }
      specs['Dimensions'] = dimensions;
      specs['Size'] = dimensions;

      // Extract price
      let price = '0.00';
      const priceSelectors = [
        '.price, .cost, .msrp, .product-price',
        '.price-current, .price-value, .amount',
        '[data-price], .price-display, .retail-price'
      ];
      
      for (const selector of priceSelectors) {
        const priceElement = $(selector);
        if (priceElement.length) {
          const priceText = priceElement.text().trim();
          const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
          if (priceMatch) {
            price = priceMatch[1].replace(',', '');
            break;
          }
        }
      }

      // Add required fields
      specs['Brand'] = this.extractBrandFromURL(url);
      specs['Price per SF'] = price;
      specs['Product URL'] = url;

      return {
        name,
        brand: this.extractBrandFromURL(url),
        price,
        category,
        description,
        imageUrl,
        dimensions,
        specifications: specs,
        sourceUrl: url
      };
    } catch (error) {
      console.error(`Error scraping generic product ${url}:`, error);
      return null;
    }
  }

  async scrapeProduct(url: string): Promise<ScrapedProduct | null> {
    await this.sleep(this.delay);
    
    const category = this.assignCategoryFromURL(url);
    
    if (url.includes('daltile.com')) {
      return this.scrapeDaltileProduct(url, category);
    } else if (url.includes('msisurfaces.com')) {
      return this.scrapeMSIProduct(url, category);
    } else {
      return this.scrapeGenericProduct(url, category);
    }
  }

  async scrapeProductList(urls: string[]): Promise<ScrapedProduct[]> {
    const results: ScrapedProduct[] = [];
    
    console.log(`Starting scrape of ${urls.length} products...`);
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`Scraping ${i + 1}/${urls.length}: ${url}`);
      
      const product = await this.scrapeProduct(url);
      if (product) {
        results.push(product);
      }
      
      // Progress update every 10 items
      if ((i + 1) % 10 === 0) {
        console.log(`Completed ${i + 1}/${urls.length} products. Success rate: ${(results.length / (i + 1) * 100).toFixed(1)}%`);
      }
    }
    
    console.log(`Scraping complete. Successfully scraped ${results.length}/${urls.length} products.`);
    return results;
  }

  convertToMaterial(scrapedProduct: ScrapedProduct): InsertMaterial & { sourceUrl: string } {
    return {
      name: scrapedProduct.name,
      category: scrapedProduct.category,
      brand: scrapedProduct.brand,
      price: scrapedProduct.price,
      imageUrl: scrapedProduct.imageUrl || null,
      description: scrapedProduct.description || null,
      specifications: scrapedProduct.specifications,
      dimensions: scrapedProduct.dimensions || null,
      inStock: true,
      sourceUrl: scrapedProduct.sourceUrl
    };
  }
}

export const productScraper = new ProductScraper();