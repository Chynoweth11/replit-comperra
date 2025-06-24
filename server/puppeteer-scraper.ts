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
        headless: 'new',
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
      
      // Scroll to trigger lazy loading
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(2000);

      // Extract all unique image URLs and product information
      const result = await page.evaluate((pageUrl) => {
        const seen = new Set();
        const images: string[] = [];
        
        // Collect all images
        document.querySelectorAll('img').forEach(img => {
          const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
          if (src && !seen.has(src) && !src.includes('data:image')) {
            seen.add(src);
            // Convert relative URLs to absolute
            const fullUrl = src.startsWith('http') ? src : new URL(src, pageUrl).href;
            images.push(fullUrl);
          }
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
          images: images.slice(0, 10), // Limit to 10 best images
          imageCount: images.length
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
          'Images': result.imageCount,
          'Description': result.description
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