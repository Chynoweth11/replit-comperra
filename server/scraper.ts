import axios from 'axios';
import * as cheerio from 'cheerio';
import type { InsertMaterial } from '@shared/schema';

// Airtable integration (optional - only if AIRTABLE_API_KEY is available)
let airtableBase: any = null;
try {
  if (process.env.AIRTABLE_API_KEY) {
    const Airtable = require('airtable');
    airtableBase = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY
    }).base(process.env.AIRTABLE_BASE_ID || 'appQJoO5GkIxDMiHS');
  }
} catch (error) {
  console.log('Airtable not available, continuing without Airtable integration');
}

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
      const html = response.data;
      
      // Enhanced name extraction with multiple fallbacks
      let name = $('h1.product-title, h1.pdp-product-name, .product-name h1, h1').first().text().trim() ||
                $('.product-title, .pdp-title').text().trim() ||
                $('meta[property="og:title"]').attr('content') ||
                $('title').text().split('|')[0].trim() ||
                'Product Name Not Found';
      
      name = name.replace(/\s+/g, ' ').trim();
      
      // Enhanced description extraction
      const description = $('.product-description, .description, .product-overview, .pdp-description')
        .first().text().trim().substring(0, 500) || '';
      
      // Enhanced image extraction with multiple fallbacks
      let imageUrl = $('img.product-image, .product-photo img, .hero-image img, .pdp-image img, img[alt*="product"]')
        .first().attr('src') || 
        $('meta[property="og:image"]').attr('content') ||
        $('img').first().attr('src') || '';
      
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
        imageUrl = 'https://www.daltile.com' + imageUrl;
      }
      
      // Enhanced specification extraction using multiple sources
      const specs: any = {};
      const fields = specTemplates[category as keyof typeof specTemplates] || [];
      
      // 1. Extract from specification tables and structured data
      $('table.specs, .specification-item, .spec-row, .product-specs tr, .specs-table tr, .technical-specs tr').each((_, elem) => {
        const key = $(elem).find('.spec-label, .label, td:first-child, th').text().trim();
        const value = $(elem).find('.spec-value, .value, td:last-child').text().trim();
        if (key && value && key !== value) {
          fields.forEach(field => {
            if (key.toLowerCase().includes(field.toLowerCase().split(' ')[0]) || 
                field.toLowerCase().includes(key.toLowerCase())) {
              specs[field] = value;
            }
          });
        }
      });

      // 2. Enhanced regex-based extraction from full page content
      const bodyText = $('body').text();
      const specsTable = $('table.specs').text();
      const headings = $('h2, h3').text();
      const fullText = `${bodyText} ${specsTable} ${headings}`;

      // Universal specification extraction (works for all categories)
      
      // PEI Rating extraction
      if (!specs['PEI Rating']) {
        const peiMatch = fullText.match(/PEI(?: Rating)?:?\s*(\d)/i);
        if (peiMatch) specs['PEI Rating'] = peiMatch[1];
      }

      // DCOF / Slip Rating extraction
      if (!specs['DCOF / Slip Rating']) {
        const dcofMatch = fullText.match(/(?:COF|DCOF)(?: \/ DCOF)?:?\s*(>?\s?0\.\d+)/i) ||
                         fullText.match(/Slip Resistance:?\s*([\d.]+)/i);
        if (dcofMatch) specs['DCOF / Slip Rating'] = dcofMatch[1];
      }

      // Water Absorption extraction
      if (!specs['Water Absorption']) {
        const waterMatch = fullText.match(/Water Absorption:?[\s<]*(\d+%|<\s?[\d.]+%)/i) ||
                          fullText.match(/Absorption:?[\s<]*(\d+\.?\d*%?)/i);
        if (waterMatch) specs['Water Absorption'] = waterMatch[1];
      }

      // Material Type extraction
      if (!specs['Material Type']) {
        const materialMatch = fullText.match(/(Ceramic|Porcelain|Natural Stone|Quartz|Glazed|Unglazed|Stone|Granite|Marble)/i);
        if (materialMatch) specs['Material Type'] = materialMatch[1];
      }

      // Finish extraction
      if (!specs['Finish']) {
        const finishMatch = fullText.match(/Finish:?\s*(Glossy|Matte|Polished|Honed|Textured|Lappato|Satin)/i) ||
                           fullText.match(/(Glossy|Matte|Polished|Honed|Textured|Lappato|Satin)/i);
        if (finishMatch) specs['Finish'] = finishMatch[1];
      }

      // Color extraction
      if (!specs['Color']) {
        const colorMatch = fullText.match(/Color:?\s*([a-zA-Z\s\-]+)/i) ||
                          name.match(/(White|Black|Gray|Grey|Blue|Navy|Beige|Brown|Green|Red|Cream|Tan)/i);
        if (colorMatch) specs['Color'] = colorMatch[1].trim();
      }

      // Edge Type extraction
      if (!specs['Edge Type']) {
        const edgeMatch = fullText.match(/Edge:?\s*(Rectified|Natural|Pressed|Straight)/i);
        if (edgeMatch) specs['Edge Type'] = edgeMatch[1];
      }

      // Texture extraction
      if (!specs['Texture']) {
        const textureMatch = fullText.match(/Texture:?\s*(Smooth|Textured|Rough|Structured)/i) ||
                            fullText.match(/(Wood Grain|Stone|Marble|Concrete|Slate)/i);
        if (textureMatch) specs['Texture'] = textureMatch[1];
      }

      // Install Location extraction
      if (!specs['Install Location']) {
        const locationMatch = fullText.match(/(Floor|Wall|Indoor|Outdoor|Commercial|Residential|Bathroom|Kitchen)/i);
        if (locationMatch) specs['Install Location'] = locationMatch[1];
      }

      // Category-specific extractions
      if (category === 'hardwood') {
        // Wood Species
        if (!specs['Wood Species']) {
          const speciesMatch = fullText.match(/(Oak|Maple|Cherry|Walnut|Pine|Hickory|Ash|Birch)/i);
          if (speciesMatch) specs['Wood Species'] = speciesMatch[1];
        }
        
        // Janka Rating
        if (!specs['Janka Rating']) {
          const jankaMatch = fullText.match(/Janka:?\s*(\d+)/i);
          if (jankaMatch) specs['Janka Rating'] = jankaMatch[1];
        }
      }

      if (category === 'heat') {
        // Coverage Area
        if (!specs['Coverage Area (SF)']) {
          const coverageMatch = fullText.match(/Coverage:?\s*(\d+)\s*(?:SF|sq\.?\s?ft)/i);
          if (coverageMatch) specs['Coverage Area (SF)'] = coverageMatch[1];
        }
        
        // Voltage
        if (!specs['Voltage']) {
          const voltageMatch = fullText.match(/(\d+)V/i);
          if (voltageMatch) specs['Voltage'] = voltageMatch[1] + 'V';
        }
      }

      if (category === 'carpet') {
        // Fiber Type
        if (!specs['Fiber Type']) {
          const fiberMatch = fullText.match(/(Nylon|Polyester|Wool|Polypropylene)/i);
          if (fiberMatch) specs['Fiber Type'] = fiberMatch[1];
        }
      }

      // Enhanced dimensions extraction
      let dimensions = $('.size, .dimensions, .product-size, .tile-size, .nominal-size').text().trim() || '';
      if (!dimensions) {
        const dimMatch = fullText.match(/(?:Size|Dimension|Nominal)s?:?\s*(\d+["']?\s*[xX×]\s*\d+["']?(?:\s*[xX×]\s*\d+["']?)?)/i) ||
                        fullText.match(/(\d+["']?\s*[xX×]\s*\d+["']?)/);
        if (dimMatch) dimensions = dimMatch[1];
      }
      specs['Dimensions'] = dimensions;
      specs['Size'] = dimensions;
      
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
      
      // Fallback price search in page content
      if (price === '0.00') {
        const priceMatch = fullText.match(/\$\s?([\d,]+\.?\d*)\s?\/?\s?(?:SF|sq\.?\s?ft|per\s?sq|square)/i);
        if (priceMatch) price = priceMatch[1].replace(',', '');
      }

      // Add required template fields
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
      const html = response.data;
      
      // Enhanced name extraction with fallbacks
      const name = $('h1').first().text().trim() ||
                  $('meta[property="og:title"]').attr('content') || 
                  $('title').text().split('|')[0].trim() ||
                  'Product Name Not Found';
      
      // Enhanced description extraction
      const description = $('.product-overview, .product-description, .description, .features').text().trim();
      
      // Enhanced image extraction using OpenGraph and multiple sources
      let imageUrl = $('meta[property="og:image"]').attr('content') ||
                    $('.product-gallery img, .hero-image img').first().attr('src') ||
                    $('img').first().attr('src') || '';
      
      if (imageUrl && imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
        imageUrl = 'https://www.msisurfaces.com' + imageUrl;
      }
      
      // Universal text matching function for deep extraction
      const textMatch = (regex: RegExp): string => {
        const match = html.match(regex);
        return match ? match[2]?.trim() || match[1]?.trim() || '—' : '—';
      };

      // Enhanced specification extraction using full page text scanning
      const specs: any = {};
      const fields = specTemplates[category as keyof typeof specTemplates] || [];
      
      // 1. Extract from structured data first
      $('table.specs, .product-specs, .specifications, li').each((_, elem) => {
        const text = $(elem).text();
        fields.forEach(field => {
          if (text.toLowerCase().includes(field.toLowerCase().split(' ')[0])) {
            const parts = text.split(':');
            if (parts.length > 1) {
              const value = parts[1].trim();
              if (value && !specs[field]) specs[field] = value;
            }
          }
        });
      });

      // 2. Deep text extraction using comprehensive regex patterns
      
      // PEI Rating - multiple patterns
      if (!specs['PEI Rating']) {
        specs['PEI Rating'] = textMatch(/PEI\s?(Rating)?:?\s?(\w+)/i) ||
                             textMatch(/Class\s*([0-5])/i) ||
                             textMatch(/Rating[:\s]*([0-5])/i);
      }

      // DCOF / Slip Rating - comprehensive extraction
      if (!specs['DCOF / Slip Rating']) {
        specs['DCOF / Slip Rating'] = textMatch(/(DCOF|COF|Slip Resistance):?\s?([>\w\.]+)/i) ||
                                     textMatch(/Coefficient[:\s]*([0-9.]+)/i);
      }

      // Water Absorption - enhanced patterns
      if (!specs['Water Absorption']) {
        specs['Water Absorption'] = textMatch(/Water Absorption:?\s?([\d<>%-]+)/i) ||
                                   textMatch(/Absorption[:\s<]*([\d<>%-]+)/i);
      }

      // Material Type - broader matching
      if (!specs['Material Type']) {
        specs['Material Type'] = textMatch(/Material:?\s?([\w ]+)/i) ||
                                textMatch(/(Porcelain|Ceramic|Stone|Quartz|Natural Stone)/i);
      }

      // Finish - enhanced extraction
      if (!specs['Finish']) {
        specs['Finish'] = textMatch(/Finish:?\s?(\w+)/i) ||
                         textMatch(/(Glossy|Matte|Polished|Honed|Textured|Lappato)/i);
      }

      // Color - multiple sources
      if (!specs['Color']) {
        specs['Color'] = textMatch(/Color:?\s?([\w ]+)/i) ||
                        name.match(/(White|Black|Gray|Grey|Blue|Navy|Beige|Brown|Green|Hale)/i)?.[1] || '—';
      }

      // Edge Type
      if (!specs['Edge Type']) {
        specs['Edge Type'] = textMatch(/Edge:?\s?(\w+)/i);
      }

      // Texture
      if (!specs['Texture']) {
        specs['Texture'] = textMatch(/Texture:?\s?(\w+)/i) ||
                          textMatch(/(Wood Grain|Stone|Marble|Concrete|Linear)/i);
      }

      // Install Location
      if (!specs['Install Location']) {
        specs['Install Location'] = textMatch(/(Floor|Wall|Indoor|Outdoor|Commercial|Residential)/i);
      }

      // Enhanced dimensions extraction
      let dimensions = $('li:contains("Size")').text().split(':')[1]?.trim() ||
                      $('li:contains("Dimensions")').text().split(':')[1]?.trim() ||
                      textMatch(/(?:Size|Dimensions?)[:\s]*(\d+["']?\s*[xX×]\s*\d+["']?)/i) ||
                      textMatch(/(\d+["']?\s*[xX×]\s*\d+["']?)/);
      
      specs['Dimensions'] = dimensions;
      specs['Size'] = dimensions;

      // Enhanced price extraction
      const extractPrice = ($: cheerio.CheerioAPI): string => {
        const priceText = $('*:contains("Price")').text();
        const match = priceText.match(/\$(\d+(\.\d{1,2})?)/);
        return match ? match[1] : '0.00';
      };

      const price = extractPrice($) || '0.00';

      // Add required template fields
      specs['Brand'] = 'MSI';
      specs['Price per SF'] = price;
      specs['Product URL'] = url;

      console.log('MSI Scraped specs:', Object.keys(specs).length, 'fields');

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

  // Universal text matching function for all scrapers
  private textMatch(html: string, regex: RegExp): string {
    const match = html.match(regex);
    return match ? match[2]?.trim() || match[1]?.trim() || '—' : '—';
  }

  async scrapeGenericProduct(url: string, category: string): Promise<ScrapedProduct | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const html = response.data;
      
      // Enhanced name extraction using universal approach
      let name = $('h1').first().text().trim() ||
                $('meta[property="og:title"]').attr('content') ||
                $('title').text().split('|')[0].trim() ||
                'Product Name Not Found';
      
      name = name.replace(/\s+/g, ' ').trim();
      
      // Enhanced description extraction
      const description = $('.product-description, .description, .overview, .product-details, .about-product')
        .first().text().trim().substring(0, 500) || '';
      
      // Enhanced image extraction using OpenGraph priority
      let imageUrl = $('meta[property="og:image"]').attr('content') ||
                    $('.product-image img, .hero-image img, .gallery img').first().attr('src') ||
                    $('img').first().attr('src') || '';
      
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
        const baseUrl = new URL(url).origin;
        imageUrl = baseUrl + imageUrl;
      }
      
      // Enhanced specification extraction using multiple sources
      const specs: any = {};
      const fields = specTemplates[category as keyof typeof specTemplates] || [];
      
      // 1. Extract from specification tables and structured data
      $('table.specs, .specs, .product-details, .specifications, .tech-specs').find('tr, li, .spec-item').each((_, elem) => {
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

      // 2. Enhanced regex-based extraction from full page content
      const bodyText = $('body').text();
      const specsTable = $('table.specs').text();
      const headings = $('h2, h3').text();
      const fullText = `${bodyText} ${specsTable} ${headings}`;

      // Universal specification extraction using comprehensive regex patterns
      
      // Enhanced PEI Rating extraction
      if (!specs['PEI Rating']) {
        specs['PEI Rating'] = this.textMatch(fullPageHtml, /PEI\s?(Rating)?:?\s?(\w+)/i) ||
                             this.textMatch(fullPageHtml, /Class\s*([0-5])/i);
      }

      // Enhanced DCOF / Slip Rating extraction  
      if (!specs['DCOF / Slip Rating']) {
        specs['DCOF / Slip Rating'] = this.textMatch(fullPageHtml, /(DCOF|COF|Slip Resistance):?\s?([>\w\.]+)/i);
      }

      // Enhanced Water Absorption extraction
      if (!specs['Water Absorption']) {
        specs['Water Absorption'] = this.textMatch(fullPageHtml, /Water Absorption:?\s?([\d<>%-]+)/i);
      }

      // Enhanced Material Type extraction
      if (!specs['Material Type']) {
        specs['Material Type'] = this.textMatch(fullPageHtml, /Material:?\s?([\w ]+)/i) ||
                                this.textMatch(fullPageHtml, /(Porcelain|Ceramic|Stone|Quartz|Natural Stone|LVT|SPC|WPC)/i);
      }

      // Enhanced Finish extraction
      if (!specs['Finish']) {
        specs['Finish'] = this.textMatch(fullPageHtml, /Finish:?\s?(\w+)/i) ||
                         this.textMatch(fullPageHtml, /(Glossy|Matte|Polished|Honed|Textured|Lappato)/i);
      }

      // Enhanced Color extraction
      if (!specs['Color']) {
        specs['Color'] = this.textMatch(fullPageHtml, /Color:?\s?([\w ]+)/i) ||
                        name.match(/(White|Black|Gray|Grey|Blue|Navy|Beige|Brown|Green|Red|Cream|Tan|Oak|Cherry|Walnut)/i)?.[1] || '—';
      }

      // Edge Type extraction
      if (!specs['Edge Type']) {
        const edgeMatch = fullText.match(/Edge:?\s*(Rectified|Natural|Pressed|Straight|Beveled)/i);
        if (edgeMatch) specs['Edge Type'] = edgeMatch[1];
      }

      // Texture extraction
      if (!specs['Texture']) {
        const textureMatch = fullText.match(/Texture:?\s*(Smooth|Textured|Rough|Structured|Embossed)/i) ||
                            fullText.match(/(Wood Grain|Stone|Marble|Concrete|Slate|Linear)/i);
        if (textureMatch) specs['Texture'] = textureMatch[1];
      }

      // Install Location extraction
      if (!specs['Install Location']) {
        const locationMatch = fullText.match(/(Floor|Wall|Indoor|Outdoor|Commercial|Residential|Bathroom|Kitchen|Countertop)/i);
        if (locationMatch) specs['Install Location'] = locationMatch[1];
      }

      // Category-specific extractions for all brands
      if (category === 'hardwood') {
        // Wood Species
        if (!specs['Wood Species']) {
          const speciesMatch = fullText.match(/(Oak|Maple|Cherry|Walnut|Pine|Hickory|Ash|Birch|Bamboo|Acacia)/i);
          if (speciesMatch) specs['Wood Species'] = speciesMatch[1];
        }
        
        // Janka Rating
        if (!specs['Janka Rating']) {
          const jankaMatch = fullText.match(/Janka:?\s*(\d+)/i);
          if (jankaMatch) specs['Janka Rating'] = jankaMatch[1];
        }

        // Construction Type
        if (!specs['Construction Type']) {
          const constructionMatch = fullText.match(/(Solid|Engineered|Laminate)/i);
          if (constructionMatch) specs['Construction Type'] = constructionMatch[1];
        }
      }

      if (category === 'lvt') {
        // Wear Layer
        if (!specs['Wear Layer']) {
          const wearMatch = fullText.match(/Wear Layer:?\s*([\d.]+\s?mil)/i);
          if (wearMatch) specs['Wear Layer'] = wearMatch[1];
        }

        // Type (SPC/WPC/LVT)
        if (!specs['Type (SPC/WPC/LVT)']) {
          const typeMatch = fullText.match(/(SPC|WPC|LVT|Luxury Vinyl)/i);
          if (typeMatch) specs['Type (SPC/WPC/LVT)'] = typeMatch[1];
        }

        // Water Resistance
        if (!specs['Water Resistance']) {
          const waterResMatch = fullText.match(/(Waterproof|Water Resistant|100% Waterproof)/i);
          if (waterResMatch) specs['Water Resistance'] = waterResMatch[1];
        }
      }

      if (category === 'slabs') {
        // Thickness
        if (!specs['Thickness']) {
          const thicknessMatch = fullText.match(/Thickness:?\s*(\d+\s?(?:mm|cm|inch))/i);
          if (thicknessMatch) specs['Thickness'] = thicknessMatch[1];
        }

        // Stone Type
        if (!specs['Stone Type']) {
          const stoneMatch = fullText.match(/(Quartz|Granite|Marble|Quartzite|Natural Stone)/i);
          if (stoneMatch) specs['Stone Type'] = stoneMatch[1];
        }
      }

      if (category === 'heat') {
        // Coverage Area
        if (!specs['Coverage Area (SF)']) {
          const coverageMatch = fullText.match(/Coverage:?\s*(\d+)\s*(?:SF|sq\.?\s?ft)/i);
          if (coverageMatch) specs['Coverage Area (SF)'] = coverageMatch[1];
        }
        
        // Voltage
        if (!specs['Voltage']) {
          const voltageMatch = fullText.match(/(\d+)V/i);
          if (voltageMatch) specs['Voltage'] = voltageMatch[1] + 'V';
        }

        // Max Temperature
        if (!specs['Max Temperature']) {
          const tempMatch = fullText.match(/(?:Max|Maximum) Temperature:?\s*(\d+°?F?)/i);
          if (tempMatch) specs['Max Temperature'] = tempMatch[1];
        }
      }

      if (category === 'carpet') {
        // Fiber Type
        if (!specs['Fiber Type']) {
          const fiberMatch = fullText.match(/(Nylon|Polyester|Wool|Polypropylene|Olefin)/i);
          if (fiberMatch) specs['Fiber Type'] = fiberMatch[1];
        }

        // Pile Height
        if (!specs['Pile Height']) {
          const pileMatch = fullText.match(/Pile Height:?\s*([\d.]+\s?(?:inch|in))/i);
          if (pileMatch) specs['Pile Height'] = pileMatch[1];
        }

        // Face Weight
        if (!specs['Face Weight']) {
          const weightMatch = fullText.match(/Face Weight:?\s*(\d+\s?oz)/i);
          if (weightMatch) specs['Face Weight'] = weightMatch[1];
        }
      }

      // Enhanced dimensions extraction
      let dimensions = $('.size, .dimensions, .product-size, .tile-size, .nominal-size').text().trim() || '';
      if (!dimensions) {
        const dimMatch = fullText.match(/(?:Size|Dimension|Nominal)s?:?\s*(\d+["']?\s*[xX×]\s*\d+["']?(?:\s*[xX×]\s*\d+["']?)?)/i) ||
                        fullText.match(/(\d+["']?\s*[xX×]\s*\d+["']?)/);
        if (dimMatch) dimensions = dimMatch[1];
      }
      specs['Dimensions'] = dimensions;
      specs['Size'] = dimensions;

      // Enhanced price extraction using universal function
      const extractPrice = ($: cheerio.CheerioAPI): string => {
        const priceText = $('*:contains("Price")').text();
        const match = priceText.match(/\$(\d+(\.\d{1,2})?)/);
        return match ? match[1] : '0.00';
      };

      const price = extractPrice($) || '0.00';

      // Add required template fields
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

  // Enhanced Airtable integration for scraped products
  async saveToAirtable(scrapedProduct: ScrapedProduct): Promise<boolean> {
    if (!airtableBase) {
      console.log('Airtable not configured, skipping Airtable save');
      return false;
    }

    try {
      const airtableRecord = {
        'Product Name': scrapedProduct.name,
        'Brand': scrapedProduct.brand,
        'Category': scrapedProduct.category,
        'Price per SF': scrapedProduct.price,
        'Product URL': scrapedProduct.sourceUrl,
        'Image URL': scrapedProduct.imageUrl || '',
        'Description': scrapedProduct.description || '',
        'Dimensions': scrapedProduct.dimensions || '',
        ...scrapedProduct.specifications // Spread all specifications
      };

      await airtableBase('Products').create([{ fields: airtableRecord }]);
      console.log(`✅ Saved ${scrapedProduct.name} to Airtable`);
      return true;
    } catch (error) {
      console.error('❌ Airtable save error:', error);
      return false;
    }
  }

  // Enhanced scrape and save method
  async scrapeAndSave(url: string): Promise<ScrapedProduct | null> {
    const scrapedProduct = await this.scrapeProduct(url);
    
    if (scrapedProduct) {
      // Try to save to Airtable if available
      await this.saveToAirtable(scrapedProduct);
      console.log('Scraped Product:', {
        name: scrapedProduct.name,
        brand: scrapedProduct.brand,
        category: scrapedProduct.category,
        specifications: Object.keys(scrapedProduct.specifications).length
      });
    }
    
    return scrapedProduct;
  }
}

export const productScraper = new ProductScraper();