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
    if (url.includes('arizonatile.com')) return 'Arizona Tile';
    if (url.includes('floridatile.com')) return 'Florida Tile';
    if (url.includes('akdo.com')) return 'AKDO';
    if (url.includes('shawfloors.com')) return 'Shaw';
    if (url.includes('mohawkflooring.com')) return 'Mohawk';
    if (url.includes('cambriausa.com')) return 'Cambria';
    if (url.includes('caesarstoneus.com')) return 'Caesarstone';
    if (url.includes('silestone.com')) return 'Silestone';
    return 'Unknown';
  }

  async scrapeDaltileProduct(url: string): Promise<ScrapedProduct | null> {
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
      
      // Clean up the name
      name = name.replace(/\s+/g, ' ').trim();
      
      // Enhanced description extraction
      const description = $('.product-description, .description, .product-overview, .pdp-description')
        .first().text().trim().substring(0, 500) || '';
      
      // Enhanced image extraction
      let imageUrl = $('img.product-image, .product-photo img, .hero-image img, .pdp-image img, img[alt*="product"]')
        .first().attr('src') || $('img').first().attr('src') || '';
      
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      
      // Enhanced specifications extraction
      const specs: any = {};
      
      // Try multiple specification selectors
      $('.specification-item, .spec-row, .product-specs tr, .specs-table tr, .technical-specs tr').each((_, elem) => {
        const key = $(elem).find('.spec-label, .label, td:first-child, th').text().trim();
        const value = $(elem).find('.spec-value, .value, td:last-child').text().trim();
        if (key && value && key !== value) {
          specs[key.toLowerCase().replace(/[\s-]+/g, '_')] = value;
        }
      });

      // Extract tile-specific specifications
      if (this.assignCategoryFromURL(url) === 'tiles') {
        // PEI Rating
        if (!specs.pei_rating) {
          const peiText = $('*:contains("PEI")').text();
          const peiMatch = peiText.match(/PEI[\s:]?(\d+)/i);
          if (peiMatch) specs.pei_rating = peiMatch[1];
        }
        
        // DCOF/Slip Rating
        if (!specs.slip_rating && !specs.dcof) {
          const dcofText = $('*:contains("DCOF"), *:contains("slip")').text();
          const dcofMatch = dcofText.match(/DCOF[\s:]?([\d.]+)/i) || dcofText.match(/([\d.]+)/);
          if (dcofMatch) specs.slip_rating = dcofMatch[1];
        }
        
        // Water Absorption
        if (!specs.water_absorption) {
          const waterText = $('*:contains("absorption"), *:contains("water")').text();
          const waterMatch = waterText.match(/([\d.]+%?)/);
          if (waterMatch) specs.water_absorption = waterMatch[1];
        }
      }

      // Enhanced dimensions extraction
      let dimensions = $('.size, .dimensions, .product-size, .tile-size').text().trim() ||
                      specs.size || specs.dimensions || specs.nominal_size || '';
      
      // Try to find dimensions in text content
      if (!dimensions) {
        const dimText = $('body').text();
        const dimMatch = dimText.match(/(\d+["']?\s*[xX×]\s*\d+["']?)/);
        if (dimMatch) dimensions = dimMatch[1];
      }
      
      // Enhanced price extraction
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

      return {
        name,
        brand: 'Daltile',
        price,
        category: this.assignCategoryFromURL(url),
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

  async scrapeMSIProduct(url: string): Promise<ScrapedProduct | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      const name = $('h1.product-name, .product-title').first().text().trim();
      const description = $('.product-overview, .product-description').text().trim();
      const imageUrl = $('.product-gallery img').first().attr('src') || '';
      
      const specs: any = {};
      $('.product-specs .spec-item, .specifications tr').each((_, elem) => {
        const key = $(elem).find('td:first-child, .spec-name').text().trim();
        const value = $(elem).find('td:last-child, .spec-value').text().trim();
        if (key && value) {
          specs[key.toLowerCase().replace(/\s+/g, '_')] = value;
        }
      });

      const dimensions = specs.size || specs.dimensions || $('.size-info').text().trim() || '';
      const priceText = $('.price-display').text().trim();
      const price = priceText.match(/[\d.]+/)?.[0] || '0.00';

      return {
        name,
        brand: 'MSI',
        price,
        category: this.assignCategoryFromURL(url),
        description,
        imageUrl: imageUrl.startsWith('//') ? 'https:' + imageUrl : imageUrl,
        dimensions,
        specifications: specs,
        sourceUrl: url
      };
    } catch (error) {
      console.error(`Error scraping MSI product ${url}:`, error);
      return null;
    }
  }

  async scrapeGenericProduct(url: string): Promise<ScrapedProduct | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Generic selectors that work across most sites
      const name = $('h1').first().text().trim() || 
                   $('.product-title, .product-name').first().text().trim() ||
                   $('title').text().split('|')[0].trim();
      
      const description = $('.product-description, .description, .overview').first().text().trim();
      
      const imageUrl = $('.product-image img, .hero-image img, .gallery img').first().attr('src') || 
                       $('img[alt*="product"], img[alt*="Product"]').first().attr('src') || '';
      
      // Extract specifications
      const specs: any = {};
      $('.specs tr, .specifications tr, .product-details tr').each((_, elem) => {
        const cells = $(elem).find('td');
        if (cells.length >= 2) {
          const key = $(cells[0]).text().trim();
          const value = $(cells[1]).text().trim();
          if (key && value) {
            specs[key.toLowerCase().replace(/\s+/g, '_')] = value;
          }
        }
      });

      // Look for common specification patterns
      $('.spec-item, .detail-item').each((_, elem) => {
        const label = $(elem).find('.label, .name, .key').text().trim();
        const value = $(elem).find('.value, .spec-value').text().trim();
        if (label && value) {
          specs[label.toLowerCase().replace(/\s+/g, '_')] = value;
        }
      });

      const dimensions = specs.size || specs.dimensions || $('.size, .dimension').text().trim() || '';
      const priceText = $('.price, .cost, .msrp').text().trim();
      const price = priceText.match(/[\d.]+/)?.[0] || '0.00';

      return {
        name,
        brand: this.extractBrandFromURL(url),
        price,
        category: this.assignCategoryFromURL(url),
        description,
        imageUrl: imageUrl.startsWith('//') ? 'https:' + imageUrl : imageUrl,
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
    
    if (url.includes('daltile.com')) {
      return this.scrapeDaltileProduct(url);
    } else if (url.includes('msisurfaces.com')) {
      return this.scrapeMSIProduct(url);
    } else {
      return this.scrapeGenericProduct(url);
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