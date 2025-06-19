import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { productScraper } from "./scraper";
import { z } from "zod";
import multer from "multer";
import csvParser from "csv-parser";
import Airtable from "airtable";

// Configure multer for file uploads
const upload = multer({ dest: '/tmp/uploads/' });

// Configure Airtable
const airtableApiKey = process.env.AIRTABLE_API_KEY;
if (!airtableApiKey) {
  console.warn('AIRTABLE_API_KEY environment variable not set. Lead capture will be disabled.');
} else {
  console.log('AIRTABLE_API_KEY configured successfully');
}

// Use the correct Airtable base ID provided by user
const baseId = 'appQJoO5GkIxDMiHS';

// API key is now properly configured

const base = airtableApiKey ? new Airtable({
  apiKey: airtableApiKey
}).base(baseId) : undefined;

console.log('Using Airtable base ID:', baseId);

export async function registerRoutes(app: Express): Promise<Server> {
  // Materials routes
  app.get("/api/materials", async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string,
        brand: req.query.brand as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        search: req.query.search as string,
      };

      console.log('Raw filters:', filters);

      // Remove undefined and empty string values, but keep category if it exists
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => {
          if (key === 'category') {
            return value !== undefined && value !== '';
          }
          return value !== undefined && value !== '';
        })
      );

      console.log('Clean filters:', cleanFilters);

      const materials = await storage.getMaterials(cleanFilters);
      console.log(`Found ${materials.length} materials for category: ${cleanFilters.category || 'all'}`);
      res.json(materials);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  app.get("/api/materials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const material = await storage.getMaterial(id);
      
      if (!material) {
        return res.status(404).json({ message: "Material not found" });
      }
      
      res.json(material);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch material" });
    }
  });

  // Articles routes
  app.get("/api/articles", async (req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);
      
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Brands routes
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  // Search suggestions
  app.get("/api/search/suggestions", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }

      const materials = await storage.getMaterials({ search: query });
      const suggestions = materials.slice(0, 5).map(m => ({
        id: m.id,
        name: m.name,
        category: m.category,
        brand: m.brand,
      }));

      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch search suggestions" });
    }
  });

  // Setup multer for file uploads
  const upload = multer({ storage: multer.memoryStorage() });

  // Bulk scraping endpoint
  app.post("/api/scrape/bulk", upload.single('urlFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const urls: string[] = [];
      const csvData = req.file.buffer.toString('utf-8');
      const rows = csvData.split('\n');
      
      for (const row of rows) {
        const url = row.trim();
        if (url && url.startsWith('http')) {
          urls.push(url);
        }
      }

      console.log(`Starting bulk scrape of ${urls.length} URLs`);
      
      const scrapedProducts = await productScraper.scrapeProductList(urls);
      
      // Convert and save to storage
      let savedCount = 0;
      for (const product of scrapedProducts) {
        try {
          const material = productScraper.convertToMaterial(product);
          await storage.createMaterial(material);
          savedCount++;
        } catch (error) {
          console.error(`Failed to save product ${product.name}:`, error);
        }
      }

      res.json({
        message: `Successfully scraped and saved ${savedCount} products`,
        scraped: scrapedProducts.length,
        saved: savedCount,
        totalUrls: urls.length
      });
    } catch (error) {
      console.error("Bulk scraping error:", error);
      res.status(500).json({ message: "Failed to process bulk scraping" });
    }
  });

  // Single URL scraping endpoint
  app.post("/api/scrape/single", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const scrapedProduct = await productScraper.scrapeProduct(url);
      if (!scrapedProduct) {
        return res.status(404).json({ message: "Failed to scrape product data" });
      }

      const material = productScraper.convertToMaterial(scrapedProduct);
      const savedMaterial = await storage.createMaterial(material);

      res.json({
        message: "Product scraped and saved successfully",
        material: savedMaterial
      });
    } catch (error) {
      console.error("Single scraping error:", error);
      res.status(500).json({ message: "Failed to scrape product" });
    }
  });

  // Scraping routes
  app.post("/api/scrape/single", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      const scrapedProduct = await productScraper.scrapeProduct(url);
      if (!scrapedProduct) {
        return res.status(400).json({ error: "Failed to scrape product from URL" });
      }

      const material = productScraper.convertToMaterial(scrapedProduct);
      const savedMaterial = await storage.createMaterial(material);

      res.json({ 
        message: "Product scraped and saved successfully",
        material: savedMaterial 
      });
    } catch (error) {
      console.error("Single scraping error:", error);
      res.status(500).json({ error: "Failed to scrape product" });
    }
  });

  app.post("/api/scrape/bulk", upload.single('urlFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const urls: string[] = [];
      const fs = await import('fs');
      
      // Read the uploaded file and extract URLs
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      for (const line of lines) {
        if (line.startsWith('http')) {
          urls.push(line);
        }
      }

      if (urls.length === 0) {
        return res.status(400).json({ error: "No valid URLs found in file" });
      }

      // Scrape products from URLs
      const scrapedProducts = await productScraper.scrapeProductList(urls);
      
      // Save scraped products to storage
      let savedCount = 0;
      for (const scrapedProduct of scrapedProducts) {
        try {
          const material = productScraper.convertToMaterial(scrapedProduct);
          await storage.createMaterial(material);
          savedCount++;
        } catch (error) {
          console.error("Error saving material:", error);
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        message: `Bulk scraping completed`,
        scraped: scrapedProducts.length,
        saved: savedCount,
        totalUrls: urls.length
      });
    } catch (error) {
      console.error("Bulk scraping error:", error);
      res.status(500).json({ error: "Failed to process bulk scraping" });
    }
  });

  // Lead capture endpoint
  app.post("/api/save-lead", async (req, res) => {
    try {
      const { name, email, zip, product } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ success: false, error: "Name and email are required" });
      }

      if (!base) {
        return res.status(503).json({ 
          success: false, 
          error: 'Lead capture service is not configured. Please contact support.' 
        });
      }

      console.log('Attempting to create lead in Airtable...');
      console.log('Lead data:', { name, email, zip, product });
      
      await base('Leads').create([
        {
          fields: {
            Name: name,
            Email: email,
            Zip: zip || '',
            Product: product || '',
            Status: 'New',
            Timestamp: new Date().toISOString(),
          },
        },
      ]);

      res.json({ success: true });
    } catch (error) {
      console.error('Airtable Error:', error);
      res.status(500).json({ success: false, error: 'Failed to save lead' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
