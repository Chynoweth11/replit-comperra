import puppeteer from 'puppeteer';

export interface PuppeteerScrapedProduct {
  productUrl: string;
  productName: string;
  images: string[];
  imageCount: number;
  category?: string;
  description?: string;
  specifications?: any;
  error?: string;
}

/**
 * Enhanced scraper using Puppeteer to capture all images including JavaScript-loaded ones
 */
export class PuppeteerScraper {
  private browser: any = null;

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrapes all image URLs (including JS-loaded) from a product page using Puppeteer
   */
  async scrapeProductWithImages(url: string): Promise<PuppeteerScrapedProduct> {
    let page;
    try {
      const browser = await this.initBrowser();
      page = await browser.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for images to load
      await page.waitForSelector('img', { timeout: 5000 }).catch(() => {});
      
      // Enhanced scrolling to trigger all lazy loading
      await page.evaluate(() => {
        // Scroll down slowly to trigger lazy loading
        return new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if(totalHeight >= scrollHeight){
              clearInterval(timer);
              resolve(true);
            }
          }, 100);
        });
      });
      
      // Wait for additional images to load
      await page.waitForTimeout(3000);
      
      // Click on image galleries, carousels, or thumbnails to reveal more images
      await page.evaluate(() => {
        // Click on common image gallery selectors
        const selectors = [
          '.thumbnail', '.thumb', '.gallery-thumb', '.product-thumb',
          '.carousel-item', '.slide', '.gallery-item', '.image-thumb',
          '[data-role="product-gallery-image"]', '[data-testid="thumbnail"]',
          '.product-image-thumb', '.swiper-slide', '.owl-item'
        ];
        
        selectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => {
            if (el instanceof HTMLElement) {
              el.click();
            }
          });
        });
      });
      
      // Wait for gallery images to load
      await page.waitForTimeout(2000);

      // Extract all unique image URLs and product information
      const result = await page.evaluate((pageUrl) => {
        const seen = new Set();
        const images: string[] = [];
        
        // Enhanced image collection with multiple selectors
        const imageSelectors = [
          'img',
          '[style*="background-image"]',
          'picture source',
          '[data-bg]',
          '[data-background]'
        ];
        
        // Collect images from img tags
        document.querySelectorAll('img').forEach(img => {
          const sources = [
            img.src,
            img.getAttribute('data-src'),
            img.getAttribute('data-lazy-src'),
            img.getAttribute('data-original'),
            img.getAttribute('data-zoom-image'),
            img.getAttribute('data-large-image'),
            img.getAttribute('srcset')?.split(',')[0]?.split(' ')[0]
          ].filter(Boolean);
          
          sources.forEach(src => {
            if (src && !seen.has(src) && !src.includes('data:image') && 
                !src.includes('base64') && src.length > 10) {
              seen.add(src);
              const fullUrl = src.startsWith('http') ? src : new URL(src, pageUrl).href;
              images.push(fullUrl);
            }
          });
        });
        
        // Collect background images
        document.querySelectorAll('[style*="background-image"]').forEach(el => {
          const style = el.getAttribute('style');
          const match = style?.match(/background-image:\s*url\(['"]?(.*?)['"]?\)/);
          if (match && match[1]) {
            const src = match[1];
            if (!seen.has(src) && !src.includes('data:image')) {
              seen.add(src);
              const fullUrl = src.startsWith('http') ? src : new URL(src, pageUrl).href;
              images.push(fullUrl);
            }
          }
        });
        
        // Filter out small icons, logos, and irrelevant images
        const filteredImages = images.filter(url => {
          const lowercaseUrl = url.toLowerCase();
          return !lowercaseUrl.includes('logo') &&
                 !lowercaseUrl.includes('icon') &&
                 !lowercaseUrl.includes('sprite') &&
                 !lowercaseUrl.includes('button') &&
                 !lowercaseUrl.includes('arrow') &&
                 !lowercaseUrl.includes('social') &&
                 !lowercaseUrl.includes('badge') &&
                 !url.includes('1x1') &&
                 !url.includes('placeholder');
        });

        // Get product name from various selectors
        const productName = (() => {
          const selectors = [
            'h1',
            '.product-title',
            '.product-name', 
            '.title',
            '[data-testid="product-title"]',
            '.product-details h1',
            '.product-info h1'
          ];
          
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent?.trim()) {
              return element.textContent.trim();
            }
          }
          return 'Unknown Product';
        })();

        // Get description
        const description = (() => {
          const selectors = [
            '.product-description',
            '.description',
            '.product-details p',
            '.product-summary'
          ];
          
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent?.trim()) {
              return element.textContent.trim();
            }
          }
          return 'Premium product with complete technical specifications';
        })();

        return {
          productName,
          description,
          images: filteredImages.slice(0, 15), // Limit to 15 best images
          imageCount: filteredImages.length,
          totalImagesFound: images.length
        };
      }, url);

      // Detect category from URL and content
      const category = this.detectCategoryFromUrl(url);

      return {
        productUrl: url,
        productName: result.productName,
        description: result.description,
        images: result.images,
        imageCount: result.imageCount,
        category,
        specifications: {
          'Product URL': url,
          'Product Name': result.productName,
          'Category': category,
          'Images Found': result.imageCount,
          'Total Images': result.totalImagesFound || result.imageCount,
          'Description': result.description,
          'Image URLs': result.images.slice(0, 5) // Store first 5 image URLs in specs
        }
      };

    } catch (error) {
      console.error('❌ Puppeteer scrape failed:', error.message);
      return {
        productUrl: url,
        productName: 'Unknown Product',
        images: [],
        imageCount: 0,
        error: error.message
      };
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Enhanced category detection with compound keyword priority
   */
  private detectCategoryFromUrl(url: string): string {
    const urlLower = url.toLowerCase();
    
    // COMPOUND KEYWORD RULES FIRST (ordered by priority)
    const compoundCategoryMap = {
      "carpet tile": "carpet",
      "carpet tiles": "carpet",
      "vinyl plank": "lvt",
      "luxury vinyl tile": "lvt",
      "luxury vinyl": "lvt",
      "engineered hardwood": "hardwood",
      "wood flooring": "hardwood",
      "floor heating": "heat",
      "radiant heating": "heat",
      "thermostat": "thermostats"
    };

    for (const [keyword, category] of Object.entries(compoundCategoryMap)) {
      if (urlLower.includes(keyword)) {
        return category;
      }
    }

    // FALLBACK SIMPLE KEYWORD RULES
    if (urlLower.includes('carpet') || urlLower.includes('rug')) return 'carpet';
    if (urlLower.includes('hardwood') || urlLower.includes('engineered')) return 'hardwood';
    if (urlLower.includes('vinyl') || urlLower.includes('lvt')) return 'lvt';
    if (urlLower.includes('slab') || urlLower.includes('quartz') || urlLower.includes('marble') || urlLower.includes('granite')) return 'slabs';
    if (urlLower.includes('heating') || urlLower.includes('radiant')) return 'heat';
    if (urlLower.includes('tile') || urlLower.includes('ceramic') || urlLower.includes('porcelain')) return 'tiles';
    
    return 'tiles'; // default
  }

  /**
   * Batch scrape multiple URLs with proper rate limiting
   */
  async scrapeMultipleProducts(urls: string[]): Promise<PuppeteerScrapedProduct[]> {
    const results: PuppeteerScrapedProduct[] = [];
    
    console.log(`Starting Puppeteer batch scrape of ${urls.length} URLs`);
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`Scraping ${i + 1}/${urls.length}: ${url}`);
      
      const result = await this.scrapeProductWithImages(url);
      results.push(result);
      
      // Rate limiting - wait 2 seconds between requests
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    await this.closeBrowser();
    return results;
  }
}

export const puppeteerScraper = new PuppeteerScraper();