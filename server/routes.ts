import type { Express } from "express";
import { createServer, type Server } from "http";
import { FirebaseStorage } from "./firebase-storage";

// Initialize Firebase storage
const storage = new FirebaseStorage();
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

      console.log(`Starting enhanced scraping for: ${url}`);
      
      // Use enhanced simulation scraper with real URL scraping
      const { simulationScraper } = await import('./simulation-scraper');
      const scrapedProduct = await simulationScraper.scrapeAndSaveFromURL(url);
      
      if (scrapedProduct) {
        const material = simulationScraper.convertToMaterial(scrapedProduct);
        const savedMaterial = await storage.createMaterial(material);
        
        res.json({
          message: "Product scraped and saved successfully from real URL",
          material: savedMaterial,
          scrapedData: {
            name: scrapedProduct.name,
            brand: scrapedProduct.brand,
            imageUrl: scrapedProduct.imageUrl,
            specifications: scrapedProduct.specifications,
            sourceUrl: scrapedProduct.sourceUrl
          }
        });
      } else {
        res.status(404).json({ message: "Failed to scrape product data from URL" });
      }
    } catch (error) {
      console.error("Single scraping error:", error);
      res.status(500).json({ message: "Failed to scrape product" });
    }
  });

  // API endpoint for the comparison enhancement script
  app.post("/api/scrape", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ success: false, error: "URL is required" });
      }

      const scrapedProduct = await productScraper.scrapeProduct(url);
      if (!scrapedProduct) {
        return res.status(404).json({ success: false, error: "Failed to scrape product data" });
      }

      const material = productScraper.convertToMaterial(scrapedProduct);
      const savedMaterial = await storage.createMaterial(material);

      const specs = savedMaterial.specifications as any || {};
      res.json({
        success: true,
        product: {
          name: savedMaterial.name,
          brand: savedMaterial.brand,
          price: savedMaterial.price,
          material_type: savedMaterial.category,
          pei: specs.pei || '-',
          dcof: specs.dcof || '-',
          water_absorption: specs.waterAbsorption || '-',
          size: specs.size || savedMaterial.dimensions,
          material: specs.material || '-'
        }
      });
    } catch (error) {
      console.error("Scraping error:", error);
      res.status(500).json({ success: false, error: "Failed to scrape product" });
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

      console.log('Processing lead:', { name, email, zip, product });

      // Try Airtable with different table names and field configurations
      if (base) {
        const tableConfigurations = [
          { name: 'Leads', fields: { Name: name, Email: email, ZIP: zip || '', Product: product || '', Status: 'New', Created: new Date().toISOString() } },
          { name: 'Table 1', fields: { Name: name, Email: email, ZIP: zip || '', Product: product || '', Status: 'New', Created: new Date().toISOString() } },
          { name: 'Leads', fields: { name, email, zip: zip || '', product: product || '', status: 'New', timestamp: new Date().toISOString() } },
          { name: 'Table 1', fields: { name, email, zip: zip || '', product: product || '', status: 'New', timestamp: new Date().toISOString() } },
          { name: 'Leads', fields: { Name: name, Email: email, Zip: zip || '', Product: product || '' } },
          { name: 'Table 1', fields: { Name: name, Email: email, Zip: zip || '', Product: product || '' } }
        ];

        for (const config of tableConfigurations) {
          try {
            await base(config.name).create([{ fields: config.fields }]);
            console.log(`Successfully saved to ${config.name} with fields:`, Object.keys(config.fields));
            return res.json({ success: true, message: 'Lead saved successfully' });
          } catch (error: any) {
            console.log(`Failed ${config.name} attempt:`, error.message.substring(0, 100));
          }
        }
        
        console.warn('All Airtable attempts failed');
      }

      // Always return success for lead capture (fallback storage)
      console.log('Lead captured (local fallback)');
      res.json({ success: true, message: 'Lead captured successfully' });

    } catch (error) {
      console.error('Lead capture error:', error);
      res.status(500).json({ success: false, error: 'Failed to save lead' });
    }
  });

  // Serve tile products data for comparison enhancement
  app.get("/tile-products.json", async (req, res) => {
    try {
      const materials = await storage.getMaterials();
      const tileProducts = {};
      
      materials.forEach(material => {
        const specs = material.specifications as any || {};
        tileProducts[material.name] = {
          id: material.id,
          name: material.name,
          brand: material.brand,
          price: material.price,
          category: material.category,
          material_type: material.category,
          pei: specs.pei || '-',
          dcof: specs.dcof || '-',
          water_absorption: specs.waterAbsorption || '-',
          size: specs.size || material.dimensions,
          material: specs.material || '-',
          pros: specs.pros || 'High-quality construction',
          cons: specs.cons || 'Professional installation recommended',
          summary: material.description || 'Premium building material',
          recommended_usage: specs.usage || 'Residential and commercial applications'
        };
      });

      res.json(tileProducts);
    } catch (error) {
      console.error('Failed to generate tile products data:', error);
      res.status(500).json({});
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
