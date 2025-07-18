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

// Enhanced category fields with comprehensive specifications including Applications, Color, and Dimensions
const ENHANCED_CATEGORY_FIELDS = {
  tiles: [
    'Product Name', 'Brand / Manufacturer', 'Category', 'Material Type', 'PEI Rating',
    'DCOF Rating', 'Water Absorption', 'Finish', 'Color', 'Thickness', 'Edge Type',
    'Texture', 'Install Location', 'Dimensions', 'Applications', 'Available Colors',
    'Available Sizes', 'Price per SF', 'Product URL', 'Image URL'
  ],
  slabs: [
    'Product Name', 'Brand / Manufacturer', 'Category', 'Material Type', 'Color / Pattern',
    'Finish', 'Thickness', 'Slab Dimensions', 'Edge Type', 'Applications', 'Water Absorption',
    'Scratch / Etch Resistance', 'Heat Resistance', 'Country of Origin', 'Available Colors',
    'Available Sizes', 'Price per SF', 'Product URL', 'Image URL'
  ],
  lvt: [
    'Product Name', 'Brand/Manufacturer', 'Category', 'Material Type', 'Wear Layer',
    'Core Type', 'Thickness', 'Width', 'Length', 'Waterproof', 'Installation Method',
    'Texture/Surface', 'Finish', 'Slip Resistance', 'Color', 'Dimensions', 'Available Colors',
    'Available Sizes', 'Applications', 'Warranty', 'Product URL', 'Image URL'
  ],
  hardwood: [
    'Product Name', 'Brand/Manufacturer', 'Category', 'Species', 'Grade', 'Construction Type',
    'Finish', 'Width', 'Thickness', 'Length', 'Material Type', 'Janka Hardness',
    'Installation Method', 'Color', 'Dimensions', 'Available Colors', 'Available Sizes',
    'Applications', 'Warranty', 'Product URL', 'Image URL'
  ],
  heat: [
    'Product Name', 'Brand/Manufacturer', 'Category', 'Type', 'Voltage', 'Coverage',
    'Features', 'Power', 'Applications', 'Warranty', 'Installation', 'Dimensions',
    'Available Sizes', 'Product URL', 'Image URL'
  ],
  carpet: [
    'Product Name', 'Brand/Manufacturer', 'Category', 'Fiber Type', 'Pile Style',
    'Face Weight', 'Density', 'Backing', 'Stain Protection', 'Traffic Rating',
    'Width', 'Color', 'Dimensions', 'Available Colors', 'Available Sizes',
    'Applications', 'Product URL', 'Image URL'
  ],
  thermostats: [
    'Product Name', 'Brand/Manufacturer', 'Category', 'Device Type', 'Voltage',
    'Load Capacity', 'Sensor Type', 'Display Type', 'Connectivity', 'Programmable',
    'Installation Type', 'Color', 'Dimensions', 'Applications', 'Warranty',
    'Product URL', 'Image URL'
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
    
    // Skip CSS-like text, WordPress variables, and template variables
    if (text.includes('--') || text.includes('wp--preset') || 
        text.includes('linear-gradient') || text.includes('{') ||
        text.includes('{{') || text.includes('}}') || text.includes('${') ||
        text.includes('var(') || text.includes('function') || 
        text.includes('css') || text.includes(':') || text.includes(';') ||
        text.includes('#') || text.includes('gradient')) {
      return '';
    }
    
    return text.trim().replace(/\s+/g, ' ');
  }

  private cleanColorPattern(text: string): string {
    if (!text) return '';
    
    // Remove CSS variables and styling artifacts - MORE AGGRESSIVE CLEANING
    if (text.includes('--') || text.includes('css') || text.includes('var(') || 
        text.includes('rgb(') || text.includes('hsl(') || text.includes('#') ||
        text.includes('gradient') || text.includes('preset') || text.includes('wp-') ||
        text.includes('preset-color') || text.includes('bluish-gray') ||
        text.includes('vivid-red') || text.includes('linear-gradient') ||
        text.includes('color-') || text.includes('000;') || text.includes('fff;') ||
        text.length > 100) {
      return 'Natural';
    }
    
    // Clean up common color pattern terms
    const cleanText = text.trim()
      .replace(/\s+/g, ' ')
      .replace(/[{}()]/g, '')
      .replace(/\s*,\s*/g, ', ');
    
    // Only return if it looks like a real color/pattern name
    if (cleanText.length > 2 && cleanText.length < 50 && 
        !cleanText.includes('function') && !cleanText.includes('style')) {
      return cleanText;
    }
    
    return '';
  }

  private categorizeMaterial(rawMaterialName: string, category: string): string {
    if (!rawMaterialName) return "Unknown";
    
    const nameLower = rawMaterialName.toLowerCase();
    
    // LVT/Vinyl category distinctions
    if (category === 'lvt') {
      if (nameLower.includes('lvt') || nameLower.includes('luxury vinyl')) {
        return 'LVT (Luxury Vinyl Tile)';
      }
      if (nameLower.includes('spc') || nameLower.includes('stone plastic')) {
        return 'SPC (Stone Plastic Composite)';
      }
      if (nameLower.includes('wpc') || nameLower.includes('wood plastic')) {
        return 'WPC (Wood Plastic Composite)';
      }
      if (nameLower.includes('vinyl') && !nameLower.includes('luxury')) {
        return 'Vinyl (General)';
      }
    }
    
    // Tile category distinctions
    if (category === 'tiles') {
      if (nameLower.includes('porcelain')) {
        return 'Porcelain Tile';
      }
      if (nameLower.includes('ceramic')) {
        return 'Ceramic Tile';
      }
      if (nameLower.includes('natural stone') || nameLower.includes('travertine') || nameLower.includes('marble')) {
        return 'Natural Stone Tile';
      }
      if (nameLower.includes('glass')) {
        return 'Glass Tile';
      }
      if (nameLower.includes('mosaic')) {
        return 'Mosaic Tile';
      }
    }
    
    // Slab category distinctions
    if (category === 'slabs') {
      if (nameLower.includes('natural granite')) {
        return 'Natural Granite';
      }
      if (nameLower.includes('natural marble')) {
        return 'Natural Marble';
      }
      if (nameLower.includes('engineered quartz') || nameLower.includes('quartz')) {
        return 'Engineered Quartz';
      }
      if (nameLower.includes('quartzite')) {
        return 'Natural Quartzite';
      }
      if (nameLower.includes('porcelain slab')) {
        return 'Porcelain Slab';
      }
    }
    
    // Hardwood category distinctions
    if (category === 'hardwood') {
      if (nameLower.includes('engineered')) {
        return 'Engineered Hardwood';
      }
      if (nameLower.includes('solid')) {
        return 'Solid Hardwood';
      }
      if (nameLower.includes('bamboo')) {
        return 'Bamboo Flooring';
      }
    }
    
    // Carpet category distinctions
    if (category === 'carpet') {
      if (nameLower.includes('carpet tile')) {
        return 'Carpet Tile';
      }
      if (nameLower.includes('broadloom')) {
        return 'Broadloom Carpet';
      }
      if (nameLower.includes('area rug')) {
        return 'Area Rug';
      }
    }
    
    // Return original if no specific rule matches
    return rawMaterialName;
  }

  // Enhanced dimension handling with standard slab sizes
  private standardSlabSizes: Record<string, string> = {
    'marble': '120" x 77"',
    'granite': '114" x 77"',
    'porcelain': '126" x 63"',
    'quartz': '126" x 63"',
    'quartzite': '130" x 77"'
  };

  private getStandardSlabSize(materialName: string): string | null {
    if (!materialName) return null;
    const materialLower = materialName.toLowerCase();
    for (const [material, size] of Object.entries(this.standardSlabSizes)) {
      if (materialLower.includes(material)) {
        return size;
      }
    }
    return null;
  }

  private applyDimensionFallback(specifications: Record<string, string>): void {
    if (!specifications['Dimensions'] && !specifications['Slab Dimensions']) {
      const materialType = specifications['Material Type'];
      const standardSize = this.getStandardSlabSize(materialType);
      if (standardSize) {
        console.log(`📏 Applying standard size for ${materialType}: ${standardSize}`);
        specifications['Slab Dimensions'] = standardSize;
      }
    }
  }

  // Pattern and texture analysis keywords
  private patternKeywords: Record<string, string[]> = {
    'veining': ['vein', 'veining', 'veined'],
    'marbled': ['marbled', 'marble-look', 'marble look'],
    'speckled': ['speckled', 'flecked', 'spotted'],
    'linear': ['linear', 'striped', 'lines'],
    'wood grain': ['wood grain', 'wood-look', 'wood look', 'grain'],
    'concrete look': ['concrete look', 'cement look']
  };

  private textureKeywords: Record<string, string[]> = {
    'polished': ['polished', 'high-gloss', 'glossy'],
    'honed': ['honed'],
    'matte': ['matte', 'low-sheen'],
    'textured': ['textured', 'brushed', 'structured', 'satin']
  };

  private analyzeVisualsFromText($: cheerio.CheerioAPI, name: string): { patterns: string[], textures: string[] } {
    const descriptionEl = $('.product-description, [itemprop="description"]').first();
    const descriptionText = descriptionEl.length ? this.cleanText(descriptionEl.text()) : '';
    const fullText = (name + ' ' + descriptionText).toLowerCase();

    const foundPatterns = new Set<string>();
    const foundTextures = new Set<string>();

    // Find patterns
    for (const [pattern, keywords] of Object.entries(this.patternKeywords)) {
      for (const keyword of keywords) {
        if (fullText.includes(keyword)) {
          foundPatterns.add(pattern);
        }
      }
    }

    // Find textures
    for (const [texture, keywords] of Object.entries(this.textureKeywords)) {
      for (const keyword of keywords) {
        if (fullText.includes(keyword)) {
          foundTextures.add(texture);
        }
      }
    }

    return {
      patterns: Array.from(foundPatterns),
      textures: Array.from(foundTextures)
    };
  }

  private extractDetailedColorCharacteristics($: cheerio.CheerioAPI, productName: string): string | null {
    console.log(`🔍 Checking detailed color for product: "${productName}"`);
    
    // Extract from product name patterns
    const nameBasedColors = this.extractColorFromProductName(productName);
    
    if (nameBasedColors.base) {
      const details = [];
      
      details.push(`Base Color: ${nameBasedColors.base}`);
      
      if (nameBasedColors.veining) {
        details.push(`Veining: ${nameBasedColors.veining}`);
      }
      
      if (nameBasedColors.highlights) {
        details.push(`Highlights: ${nameBasedColors.highlights}`);
      }
      
      if (nameBasedColors.tones) {
        details.push(`Occasional Tones: ${nameBasedColors.tones}`);
      }
      
      const result = details.join(', ');
      console.log(`🎨 Generated detailed color: ${result}`);
      return result;
    }
    
    console.log(`🎨 No detailed color pattern matched for: "${productName}"`);
    return null;
  }

  private extractColorFromProductName(productName: string): { base?: string; veining?: string; highlights?: string; tones?: string } {
    const nameLower = productName.toLowerCase();
    const result: { base?: string; veining?: string; highlights?: string; tones?: string } = {};
    
    console.log(`🔍 Analyzing product name: "${productName}" -> "${nameLower}"`);
    
    // Blue Tahoe Satin specific pattern
    if (nameLower.includes('blue') && nameLower.includes('tahoe')) {
      console.log(`🎯 MATCHED: Blue Tahoe pattern detected!`);
      result.base = 'Soft blue-silver';
      result.veining = 'Medium grey, swirling';
      result.highlights = 'Bright white accents';
      result.tones = 'Light browns/oxidation in veins';
    }
    // Black Galaxy patterns
    else if (nameLower.includes('black') && (nameLower.includes('galaxy') || nameLower.includes('pearl'))) {
      console.log(`🎯 MATCHED: Black Galaxy pattern detected!`);
      result.base = 'Deep black';
      result.veining = 'Gold and silver speckles';
      result.highlights = 'Metallic accents';
    }
    // White/Cream marbles
    else if (nameLower.includes('white') || nameLower.includes('cream') || nameLower.includes('carrara')) {
      result.base = 'Pure white';
      result.veining = 'Gray veining, linear';
      result.highlights = 'Subtle gray undertones';
    }
    // Brown/Tan quartzites
    else if (nameLower.includes('brown') || nameLower.includes('tan') || nameLower.includes('bronze')) {
      result.base = 'Warm brown';
      result.veining = 'Darker brown patterns';
      result.highlights = 'Golden highlights';
    }
    
    return result;
  }

  private extractColorsAndPattern($: cheerio.CheerioAPI): { colors: string[], pattern: string | null } {
    const colors: string[] = [];
    let pattern: string | null = null;

    // Method 1: Extract from specification tables (most reliable)
    const specRows = $('.product-specs tr, .product-details__specifications tr, .specifications tr, .spec-table tr');
    
    specRows.each((_, row) => {
      const $row = $(row);
      const th = $row.find('th, .spec-label, .label');
      const td = $row.find('td, .spec-value, .value');
      
      if (th.length && td.length) {
        const label = this.cleanText(th.text()).toLowerCase();
        const value = this.cleanText(td.text());
        
        if (value && this.isValidColorOrPattern(value) && !this.isCSSContent(value)) {
          if (label.includes('color') || label.includes('colour')) {
            colors.push(value);
          } else if (label.includes('pattern') || label.includes('veining') || label.includes('finish')) {
            pattern = value;
          }
        }
      }
    });

    // Method 2: Extract from color swatches and options
    const colorSelectors = [
      '.color-swatch-name', '.product-color-name', '.color-name', '[data-color-name]', 
      '.color-option', '.swatch-label', '.color-choice', '.finish-option'
    ];
    
    for (const selector of colorSelectors) {
      $(selector).each((_, el) => {
        const $el = $(el);
        let colorText = $el.attr('data-color-name') || $el.attr('title') || this.cleanText($el.text());
        
        if (colorText && this.isValidColorOrPattern(colorText) && !this.isCSSContent(colorText)) {
          colors.push(colorText);
        }
      });
    }

    // Method 3: Extract from general product detail blocks (enhanced with CSS filtering)
    const detailBlocks = $('.product-detail-info, .product-details__specifications, .product-description, .specs-section');
    
    detailBlocks.each((_, block) => {
      let text = $(block).text();
      
      // Pre-filter out CSS content from text blocks
      if (this.isCSSContent(text) || text.includes('--wp--preset') || text.includes('linear-gradient')) {
        return; // Skip this entire block if it contains CSS
      }
      
      // Enhanced detailed color extraction for characteristics like Blue Tahoe Satin
      const detailedColorPatterns = [
        /base\s+color[:\s]+([\w\s\-]+?)(?:[,\.]|$)/gi,
        /veining[:\s]+([\w\s\-,]+?)(?:[,\.]|$)/gi,
        /highlights?[:\s]+([\w\s\-]+?)(?:[,\.]|$)/gi,
        /occasional\s+tones?[:\s]+([\w\s\-\/]+?)(?:[,\.]|$)/gi,
        /predominant\s+color[:\s]+([\w\s\-]+?)(?:[,\.]|$)/gi,
        /accent\s+color[:\s]+([\w\s\-]+?)(?:[,\.]|$)/gi,
        /background\s+color[:\s]+([\w\s\-]+?)(?:[,\.]|$)/gi
      ];
      
      detailedColorPatterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          const colorValue = match[1].trim();
          if (this.isValidColorOrPattern(colorValue) && !this.isCSSContent(colorValue)) {
            colors.push(colorValue);
          }
        }
      });
      
      // Look for color patterns in text (expanded color vocabulary including blue, silver)
      const colorMatches = text.match(/\b(white|black|gray|grey|brown|beige|cream|tan|ivory|charcoal|espresso|honey|natural|oak|maple|cherry|walnut|mahogany|pine|birch|blue|silver|gold|bronze|tahoe|satin)\b/gi);
      if (colorMatches) {
        colorMatches.forEach(match => {
          const colorValue = match.trim();
          if (this.isValidColorOrPattern(colorValue) && !this.isCSSContent(colorValue)) {
            colors.push(colorValue.charAt(0).toUpperCase() + colorValue.slice(1).toLowerCase());
          }
        });
      }

      // Look for pattern in text (enhanced with swirling, oxidation for Blue Tahoe Satin)
      const patternMatches = text.match(/\b(veined|veining|marbled|speckled|uniform|linear|distressed|hand-scraped|subway|mosaic|hexagon|herringbone|swirling|oxidation)\b/gi);
      if (patternMatches && !pattern) {
        const foundPattern = patternMatches[0].trim();
        if (this.isValidColorOrPattern(foundPattern) && !this.isCSSContent(foundPattern)) {
          pattern = foundPattern.charAt(0).toUpperCase() + foundPattern.slice(1).toLowerCase();
        }
      }
    });

    return {
      colors: [...new Set(colors)].slice(0, 8), // Remove duplicates and limit
      pattern
    };
  }

  private isValidColorOrPattern(text: string): boolean {
    if (!text || text.length < 2 || text.length > 50) return false;
    
    // Reject CSS variables and WordPress color variables specifically
    if (text.includes('--') || text.includes('wp--preset') || 
        text.includes('linear-gradient') || text.includes('{') || 
        text.includes('var(') || text.includes('function') || 
        text.includes('css') || text.includes('#') || 
        text.includes('px') || text.includes('rgb') || 
        text.includes('hsl') || text.includes('rgba') ||
        text.includes('hsla') || text.includes(':') ||
        text.includes(';') || text.includes('gradient')) {
      return false;
    }
    
    // Reject template variables
    if (text.includes('{{') || text.includes('}}') || 
        text.includes('${') || text.includes('%') ||
        text.includes('currentItem') || text.includes('product.')) {
      return false;
    }
    
    // Reject obvious CSS/style content
    if (text.match(/^\s*[\-\#\.\@\$]/)) return false;
    
    // Must contain at least one letter and be reasonable length
    if (!/[A-Za-z]/.test(text) || text.length > 30) return false;
    
    return true;
  }

  private isCSSContent(text: string): boolean {
    if (!text) return false;
    
    // Comprehensive CSS detection patterns
    const cssPatterns = [
      /--[\w\-]+:/,                    // CSS variables like --black:
      /wp--preset/,                    // WordPress color presets
      /#[0-9a-fA-F]{3,6}/,            // Hex colors
      /rgba?\([^)]+\)/,               // RGB/RGBA functions
      /hsla?\([^)]+\)/,               // HSL/HSLA functions
      /linear-gradient/,               // Gradients
      /[\w\-]+\s*:\s*[^;]+;/,         // CSS property:value; pairs
      /^[\s]*--/,                     // Lines starting with CSS variables
      /;\s*--/,                       // CSS variable chains
      /:[\w\-#]+;/                    // CSS value endings
    ];
    
    return cssPatterns.some(pattern => pattern.test(text));
  }

  private extractActiveColor($: cheerio.CheerioAPI): string | null {
    const activeSelectors = [
      '.color-swatch.active .color-name',
      '.color-option.selected .option-label',
      'button[aria-pressed="true"] .swatch-name',
      '[data-option-selected="true"]',
      '.color-swatch.selected'
    ];

    for (const selector of activeSelectors) {
      const activeEl = $(selector).first();
      if (activeEl.length) {
        const colorName = activeEl.attr('data-color-name') || this.cleanText(activeEl.text());
        if (colorName) {
          console.log(`🎨 Found active color: ${colorName}`);
          return colorName;
        }
      }
    }
    return null;
  }

  private extractProductImages($: cheerio.CheerioAPI, url: string, limit: number = 5): string[] {
    const imageSelectors = [
      'img.product-image',
      '.product-gallery img',
      '.product-main-image img',
      'img[data-src]',
      '.hero-image img',
      '.product-photos img',
      '.zoom-image'
    ];

    const images: string[] = [];
    
    for (const selector of imageSelectors) {
      if (images.length >= limit) break;
      
      $(selector).each((_, img) => {
        if (images.length >= limit) return false;
        
        const $img = $(img);
        let imgSrc = $img.attr('data-src') || $img.attr('src') || $img.attr('data-lazy-src');
        
        if (imgSrc) {
          // Convert relative URLs to absolute
          if (imgSrc.startsWith('//')) {
            imgSrc = 'https:' + imgSrc;
          } else if (imgSrc.startsWith('/')) {
            const baseUrl = new URL(url);
            imgSrc = `${baseUrl.protocol}//${baseUrl.host}${imgSrc}`;
          } else if (!imgSrc.startsWith('http')) {
            imgSrc = new URL(imgSrc, url).href;
          }
          
          // Filter out logos, icons, and placeholder images
          const imgName = imgSrc.toLowerCase();
          if (!imgName.includes('logo') && !imgName.includes('icon') && 
              !imgName.includes('placeholder') && !imgName.includes('spinner') &&
              !imgName.includes('loading') && imgSrc.length > 20) {
            images.push(imgSrc);
          }
        }
      });
    }

    return [...new Set(images)]; // Remove duplicates
  }

  private extractColorFromNameAndURL(name: string, url: string): string {
    const text = (name + ' ' + url).toLowerCase();
    
    // Common color patterns with their natural descriptions
    const colorPatterns = [
      { pattern: /white|bianco|blanco/i, color: 'White' },
      { pattern: /black|nero|negro/i, color: 'Black' },
      { pattern: /gray|grey|grigio/i, color: 'Gray' },
      { pattern: /brown|marrone/i, color: 'Brown' },
      { pattern: /beige|cream|crema/i, color: 'Beige' },
      { pattern: /gold|oro|dorado/i, color: 'Gold' },
      { pattern: /silver|argento/i, color: 'Silver' },
      { pattern: /blue|blu|azul/i, color: 'Blue' },
      { pattern: /green|verde/i, color: 'Green' },
      { pattern: /red|rosso|rojo/i, color: 'Red' },
      { pattern: /arabescato/i, color: 'White with gray veining' },
      { pattern: /calacatta/i, color: 'White with dramatic veining' },
      { pattern: /carrara/i, color: 'White with subtle gray veining' },
      { pattern: /statuario/i, color: 'Pure white with bold veining' },
      { pattern: /emperador/i, color: 'Brown with cream veining' },
      { pattern: /travertine/i, color: 'Beige with natural patterns' },
      { pattern: /absolute|nero/i, color: 'Deep black' },
      { pattern: /pearl/i, color: 'Black with silver speckles' }
    ];

    for (const { pattern, color } of colorPatterns) {
      if (pattern.test(text)) {
        return color;
      }
    }

    return 'Natural stone coloring';
  }

  private normalizeThickness(thickness: string): string {
    if (!thickness) return '';
    
    // Convert mm to cm for better readability
    const mmMatch = thickness.match(/(\d+\.?\d*)mm/i);
    if (mmMatch) {
      const mm = parseFloat(mmMatch[1]);
      const cm = mm / 10;
      return `${cm}cm`;
    }
    
    // Keep cm as is
    if (thickness.includes('cm')) {
      return thickness;
    }
    
    // Keep inches as is
    if (thickness.includes('"') || thickness.includes('inch')) {
      return thickness;
    }
    
    return thickness;
  }

  private sanitizePrice(priceText: string): string {
    if (!priceText) return 'Contact for pricing';
    
    // Clean up the text
    const cleanText = priceText.toLowerCase().trim();
    
    // Check for contact indicators or invalid price data
    if (cleanText.includes('contact') || cleanText.includes('call') || 
        cleanText.includes('quote') || cleanText.includes('request') ||
        cleanText.includes('login') || cleanText.includes('sign in') ||
        cleanText.includes('css') || cleanText.includes('--') ||
        cleanText.includes('undefined') || cleanText.includes('null') ||
        cleanText.length === 0 || cleanText.length < 2) {
      return 'Contact for pricing';
    }
    
    // Extract meaningful numeric price with currency (must be reasonable)
    const priceMatch = priceText.match(/\$?(\d+\.?\d*)/);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1]);
      // If price is suspiciously low (like $5 when there should be no price), return contact
      if (price < 10 && !priceText.includes('per sq') && !priceText.includes('/sq')) {
        return 'Contact for pricing';
      }
      return priceMatch[1]; // Return just the number, $ symbol handled in display
    }
    
    // Extract price range
    const rangeMatch = priceText.match(/\$?(\d+\.?\d*)\s*-\s*\$?(\d+\.?\d*)/);
    if (rangeMatch) {
      return `${rangeMatch[1]}-${rangeMatch[2]}`;
    }
    
    // Return contact for pricing if no valid price found
    return 'Contact for pricing';
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

  private extractProductNameFromURL(url: string): string {
    // Extract product name from URL path
    const pathParts = url.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Clean up the URL segment
    const cleanName = lastPart
      .replace(/[-_]/g, ' ')
      .replace(/\.(html|htm|php|asp|aspx)$/i, '')
      .trim();
    
    if (cleanName && cleanName.length > 1) {
      // Special handling for granite names
      if (cleanName.includes('satin') || cleanName.includes('polished') || cleanName.includes('honed')) {
        return cleanName.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
      }
      
      return cleanName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    
    return 'Unknown Product';
  }

  private extractMaterialTypeFromURL(url: string): string | null {
    const urlLower = url.toLowerCase();
    
    // CRITICAL: Check quartzite before quartz to avoid misclassification
    if (urlLower.includes('quartzite')) {
      return 'Natural Quartzite';
    } else if (urlLower.includes('granite')) {
      return 'Natural Granite';
    } else if (urlLower.includes('marble')) {
      return 'Natural Marble';
    } else if (urlLower.includes('quartz')) {
      return 'Engineered Quartz';
    } else if (urlLower.includes('porcelain') && urlLower.includes('slab')) {
      return 'Porcelain Slab';
    }
    
    return null;
  }

  private detectCategoryFromURL(url: string): string {
    const urlLower = url.toLowerCase();
    
    // Enhanced category detection with proper priority ordering
    // Check for slabs first (most specific)
    if (urlLower.includes('/slab/') || urlLower.includes('slab/') || urlLower.includes('/slabs/')) {
      return 'slabs';
    }
    
    // Check for granite, marble, quartzite, quartz (slab materials) - QUARTZITE FIRST
    if (urlLower.includes('granite') || urlLower.includes('marble') || 
        urlLower.includes('quartzite') || urlLower.includes('quartz')) {
      // But only if it's not explicitly a tile
      if (!urlLower.includes('tile/') && !urlLower.includes('/tile')) {
        return 'slabs';
      }
    }
    
    // Check for countertop materials
    if (urlLower.includes('countertop') || urlLower.includes('counter-top')) {
      return 'slabs';
    }
    
    // Check for compound carpet terms first
    if (urlLower.includes('carpet-tile') || urlLower.includes('carpet-tiles')) {
      return 'carpet';
    }
    
    // Check for LVT/vinyl terms
    if (urlLower.includes('vinyl-plank') || urlLower.includes('luxury-vinyl') || 
        urlLower.includes('lvt') || urlLower.includes('lvp')) {
      return 'lvt';
    }
    
    // Check for hardwood terms
    if (urlLower.includes('hardwood') || urlLower.includes('engineered-wood') || 
        urlLower.includes('solid-wood') || urlLower.includes('wood-flooring')) {
      return 'hardwood';
    }
    
    // Check for heating terms
    if (urlLower.includes('thermostat')) {
      return 'thermostats';
    }
    
    if (urlLower.includes('heating-system') || urlLower.includes('radiant-heat') || 
        urlLower.includes('floor-heating') || urlLower.includes('underfloor-heating') || 
        urlLower.includes('heat-mat') || urlLower.includes('heating-cable')) {
      return 'heat';
    }
    
    // Check for carpet terms
    if (urlLower.includes('carpet') || urlLower.includes('rug')) {
      return 'carpet';
    }
    
    // Check for tile terms (after other checks)
    if (urlLower.includes('tile') || urlLower.includes('ceramic') || urlLower.includes('porcelain')) {
      return 'tiles';
    }
    
    return 'tiles'; // Default fallback
  }

  private extractSpecifications($: cheerio.CheerioAPI, category: string): Record<string, string> {
    const specs: Record<string, string> = {};
    
    // Method 1: Specification tables - comprehensive approach
    $('table, .spec-table, .specifications, .product-specs, .tech-specs, .details-table').each((_, table) => {
      $(table).find('tr').each((_, row) => {
        const cells = $(row).find('td, th');
        if (cells.length >= 2) {
          const key = this.cleanText(cells.first().text());
          const value = this.cleanText(cells.last().text());
          if (key && value && key.length > 1 && value.length > 1 && !key.toLowerCase().includes('specification')) {
            specs[key] = value;
          }
        }
      });
    });

    // Method 2: Definition lists - enhanced
    $('dl, .spec-list dl, .product-details dl').each((_, dl) => {
      $(dl).find('dt').each((_, dt) => {
        const key = this.cleanText($(dt).text());
        const value = this.cleanText($(dt).next('dd').text());
        if (key && value && key.length > 1 && value.length > 1) {
          specs[key] = value;
        }
      });
    });

    // Method 3: Key-value pairs - comprehensive selectors
    $('.spec-item, .specification-item, .product-spec, .detail-row, .feature-row, .attribute').each((_, item) => {
      const $item = $(item);
      const label = $item.find('.spec-label, .label, .key, .name, .title, strong').first();
      const value = $item.find('.spec-value, .value, .val, .data, .info, span').last();
      
      if (label.length && value.length) {
        const key = this.cleanText(label.text().replace(':', ''));
        const val = this.cleanText(value.text());
        if (key && val && key.length > 1 && val.length > 1) {
          specs[key] = val;
        }
      }
    });

    // Method 4: Structured data extraction - enhanced
    $('[itemprop], [data-spec], [data-attribute]').each((_, elem) => {
      const $elem = $(elem);
      const prop = $elem.attr('itemprop') || $elem.attr('data-spec') || $elem.attr('data-attribute');
      const value = this.cleanText($elem.text() || $elem.attr('content') || '');
      if (prop && value && value.length > 1) {
        specs[prop] = value;
      }
    });

    // Method 5: Text mining for specifications
    const fullText = $('body').text();
    this.mineSpecificationsFromText(fullText, category, specs);

    return specs;
  }

  private mineSpecificationsFromText(text: string, category: string, specs: Record<string, string>): void {
    // Category-specific mining patterns including Applications, Color, and Dimensions
    const patterns = {
      tiles: [
        /PEI Rating:?\s*([^,\n]+)/i,
        /DCOF[^:]*:?\s*([^,\n]+)/i,
        /Water Absorption:?\s*([^,\n]+)/i,
        /Material Type:?\s*([^,\n]+)/i,
        /Finish:?\s*([^,\n]+)/i,
        /Thickness:?\s*([^,\n]+)/i,
        /Edge Type:?\s*([^,\n]+)/i,
        /Texture:?\s*([^,\n]+)/i,
        /Install Location:?\s*([^,\n]+)/i,
        /Applications?:?\s*([^,\n]+)/i,
        /Color:?\s*([^,\n]+)/i,
        /Colors?:?\s*([^,\n]+)/i,
        /Dimensions?:?\s*([^,\n]+)/i,
        /Size:?\s*([^,\n]+)/i,
      ],
      slabs: [
        /Material Type:?\s*([^,\n]+)/i,
        /Finish:?\s*([^,\n]+)/i,
        /Thickness:?\s*([^,\n]+)/i,
        /Slab Dimensions:?\s*([^,\n]+)/i,
        /Edge Type:?\s*([^,\n]+)/i,
        /Water Absorption:?\s*([^,\n]+)/i,
        /Scratch Resistance:?\s*([^,\n]+)/i,
        /Heat Resistance:?\s*([^,\n]+)/i,
        /Applications?:?\s*([^,\n]+)/i,
        /Color:?\s*([^,\n]+)/i,
        /Colors?:?\s*([^,\n]+)/i,
        /Dimensions?:?\s*([^,\n]+)/i,
        /Available.*Colors?:?\s*([^,\n]+)/i,
        /Available.*Sizes?:?\s*([^,\n]+)/i,
      ],
      hardwood: [
        /Species:?\s*([^,\n]+)/i,
        /Grade:?\s*([^,\n]+)/i,
        /Construction:?\s*([^,\n]+)/i,
        /Janka Hardness:?\s*([^,\n]+)/i,
        /Width:?\s*([^,\n]+)/i,
        /Thickness:?\s*([^,\n]+)/i,
        /Length:?\s*([^,\n]+)/i,
        /Applications?:?\s*([^,\n]+)/i,
        /Color:?\s*([^,\n]+)/i,
        /Colors?:?\s*([^,\n]+)/i,
        /Dimensions?:?\s*([^,\n]+)/i,
        /Available.*Colors?:?\s*([^,\n]+)/i,
        /Available.*Sizes?:?\s*([^,\n]+)/i,
      ],
      lvt: [
        /Wear Layer:?\s*([^,\n]+)/i,
        /Core Type:?\s*([^,\n]+)/i,
        /Waterproof:?\s*([^,\n]+)/i,
        /Installation:?\s*([^,\n]+)/i,
        /Slip Resistance:?\s*([^,\n]+)/i,
        /Applications?:?\s*([^,\n]+)/i,
        /Color:?\s*([^,\n]+)/i,
        /Colors?:?\s*([^,\n]+)/i,
        /Dimensions?:?\s*([^,\n]+)/i,
        /Available.*Colors?:?\s*([^,\n]+)/i,
        /Available.*Sizes?:?\s*([^,\n]+)/i,
      ],
      heat: [
        /Voltage:?\s*([^,\n]+)/i,
        /Wattage:?\s*([^,\n]+)/i,
        /Coverage:?\s*([^,\n]+)/i,
        /Installation:?\s*([^,\n]+)/i,
        /Applications?:?\s*([^,\n]+)/i,
        /Dimensions?:?\s*([^,\n]+)/i,
        /Available.*Sizes?:?\s*([^,\n]+)/i,
      ],
      carpet: [
        /Fiber Type:?\s*([^,\n]+)/i,
        /Pile Style:?\s*([^,\n]+)/i,
        /Face Weight:?\s*([^,\n]+)/i,
        /Density:?\s*([^,\n]+)/i,
        /Stain Protection:?\s*([^,\n]+)/i,
        /Applications?:?\s*([^,\n]+)/i,
        /Color:?\s*([^,\n]+)/i,
        /Colors?:?\s*([^,\n]+)/i,
        /Dimensions?:?\s*([^,\n]+)/i,
        /Available.*Colors?:?\s*([^,\n]+)/i,
        /Available.*Sizes?:?\s*([^,\n]+)/i,
      ],
      thermostats: [
        /Voltage:?\s*([^,\n]+)/i,
        /Load Capacity:?\s*([^,\n]+)/i,
        /Sensor Type:?\s*([^,\n]+)/i,
        /Display Type:?\s*([^,\n]+)/i,
        /Programmable:?\s*([^,\n]+)/i,
        /Applications?:?\s*([^,\n]+)/i,
        /Color:?\s*([^,\n]+)/i,
        /Dimensions?:?\s*([^,\n]+)/i,
      ]
    };

    const categoryPatterns = patterns[category as keyof typeof patterns] || patterns.tiles;
    
    categoryPatterns.forEach((pattern) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        const key = pattern.source.split(':')[0].replace(/[^a-zA-Z\s]/g, '');
        const value = match[1].trim();
        if (value.length > 1 && !specs[key]) {
          specs[key] = value;
        }
      }
    });

    // Extract multiple colors and sizes
    this.extractMultipleOptions(text, specs);
  }

  private extractMultipleOptions(text: string, specs: Record<string, string>): void {
    // Extract multiple colors
    const colorPatterns = [
      /Available\s+Colors?[:\s]*((?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s*,\s*)?)+)/i,
      /Colors?[:\s]*((?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s*,\s*)?){2,})/i,
      /Choose\s+from[:\s]*((?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s*,\s*)?)+)/i,
    ];

    for (const pattern of colorPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const colors = match[1].split(',').map(c => c.trim()).filter(c => c.length > 2);
        if (colors.length > 1) {
          specs['Available Colors'] = colors.join(', ');
          break;
        }
      }
    }

    // Extract multiple sizes
    const sizePatterns = [
      /Available\s+Sizes?[:\s]*((?:\d+[\"'′]?\s*x\s*\d+[\"'′]?(?:\s*,\s*)?)+)/i,
      /Sizes?[:\s]*((?:\d+[\"'′]?\s*x\s*\d+[\"'′]?(?:\s*,\s*)?){2,})/i,
      /Dimensions?[:\s]*((?:\d+[\"'′]?\s*x\s*\d+[\"'′]?(?:\s*,\s*)?)+)/i,
    ];

    for (const pattern of sizePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const sizes = match[1].split(',').map(s => s.trim()).filter(s => s.length > 2);
        if (sizes.length > 1) {
          specs['Available Sizes'] = sizes.join(', ');
          break;
        }
      }
    }
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
          $('h1.product-title, h1[itemprop="name"], h1.product-name, .product-title h1, h1').first().text()
        ) || this.extractProductNameFromURL(url);

        const brand = this.extractBrandFromURL(url);
        const category = this.detectCategoryFromURL(url);
        
        // Enhanced material type detection from URL for quartzite vs quartz
        const materialTypeFromURL = this.extractMaterialTypeFromURL(url);
        
        // Extract price - improved extraction with multiple selectors
        const priceSelectors = [
          '.product-price', '.price', '[itemprop="price"]', '.price-current',
          '.pricing', '.cost', '.product-cost', '.price-value', '.price-display',
          '.price-box', '.price-info', '.product-pricing'
        ];
        
        let rawPrice = '';
        for (const selector of priceSelectors) {
          const element = $(selector).first();
          if (element.length) {
            rawPrice = this.cleanText(element.text());
            if (rawPrice && rawPrice.length > 1) break;
          }
        }
        
        const price = this.sanitizePrice(rawPrice);

        // Extract description
        const description = this.cleanText(
          $('.product-description, .description, [itemprop="description"]').first().text()
        ) || `${brand} ${name}`;

        // Extract specifications with category-specific enhancement
        const specifications = this.extractSpecifications($, category);
        
        // Add basic specifications
        specifications['Product Name'] = name;
        specifications['Brand / Manufacturer'] = brand;
        specifications['Category'] = category;
        specifications['Price'] = price;
        specifications['Product URL'] = url;
        
        // Set material type from URL if detected (overrides later detection)
        if (materialTypeFromURL) {
          specifications['Material Type'] = materialTypeFromURL;
          console.log(`🎯 Material type from URL: ${materialTypeFromURL}`);
        }
        
        // Add detailed color characteristics if available
        const detailedColorInfo = this.extractDetailedColorCharacteristics($, name);
        if (detailedColorInfo) {
          specifications['Detailed Color Characteristics'] = detailedColorInfo;
          console.log(`🎨 Enhanced color details: ${detailedColorInfo}`);
        } else {
          console.log(`🎨 No detailed color pattern found for: "${name}"`);
        }

        // Enhance specifications with category-specific defaults
        this.enhanceSpecifications(specifications, category, brand);

        // Enhanced image extraction (do this first)
        const productImages = this.extractProductImages($, url, 5);
        let extractedImageUrls = productImages.length > 0 ? productImages : [];
        
        // Fallback to original image extraction if enhanced didn't work
        if (extractedImageUrls.length === 0) {
          const fallbackImages = this.extractImages($, url);
          extractedImageUrls = fallbackImages;
        }
        
        const imageUrl = extractedImageUrls.length > 0 ? extractedImageUrls[0] : '';
        specifications['Image URL'] = imageUrl;

        // Extract dimensions with enhanced fallback logic
        let dimensions = specifications['Dimensions'] || specifications['Size'] || 
                        specifications['Dimension'] || '';
        
        // Apply dimension fallback for slabs
        this.applyDimensionFallback(specifications);
        
        // Use enhanced dimension extraction with actual standard sizes
        if (!dimensions && category === 'slabs') {
          const materialType = specifications['Material Type'];
          const standardSize = this.getStandardSlabSize(materialType);
          if (standardSize) {
            dimensions = `Standard size of the slab material, could vary (Standard: ${standardSize})`;
            specifications['Slab Dimensions'] = standardSize;
          } else {
            dimensions = 'Standard size of the slab material, could vary (Standard: 120" x 77")';
            specifications['Slab Dimensions'] = '120" x 77"';
          }
        } else if (!dimensions) {
          dimensions = '12" x 12"'; // Default for other categories
        }

        // Extract colors and patterns using enhanced method
        const colorData = this.extractColorsAndPattern($);
        
        if (colorData.colors.length > 0) {
          specifications['Available Colors'] = colorData.colors.join(', ');
        }
        
        if (colorData.pattern) {
          specifications['Pattern'] = colorData.pattern;
        }

        // Extract active/selected color
        const activeColor = this.extractActiveColor($);
        if (activeColor && this.isValidColorOrPattern(activeColor)) {
          specifications['Selected Color'] = activeColor;
        }

        // Enhanced color/pattern analysis from URL and product name (fallback)
        const urlBasedColor = this.extractColorFromNameAndURL(name, url);
        if (urlBasedColor && (!specifications['Color / Pattern'] || specifications['Color / Pattern'] === 'Natural') && !this.isCSSContent(urlBasedColor)) {
          specifications['Color / Pattern'] = urlBasedColor;
        }

        // Final CSS cleanup check for all color-related fields
        Object.keys(specifications).forEach(key => {
          if (key.toLowerCase().includes('color') || key.toLowerCase().includes('pattern')) {
            const value = specifications[key];
            if (value && this.isCSSContent(value)) {
              console.log(`🚫 Removing CSS content from ${key}: ${value}`);
              delete specifications[key];
            }
          }
        });

        // Analyze visual characteristics from text
        const visuals = this.analyzeVisualsFromText($, name);
        if (visuals.patterns.length > 0) {
          specifications['Pattern Types'] = visuals.patterns.join(', ');
        }
        if (visuals.textures.length > 0) {
          specifications['Texture Types'] = visuals.textures.join(', ');
        }

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
          imageUrls: extractedImageUrls
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

  private enhanceSpecifications(specifications: Record<string, string>, category: string, brand: string): void {
    // Save material type if it was set from URL (highest priority)
    const urlBasedMaterialType = specifications['Material Type'];
    // First, clean up existing specifications
    const cleanedSpecs: Record<string, string> = {};
    Object.entries(specifications).forEach(([key, value]) => {
      if (key && value && key.length > 1 && value.length > 1) {
        // Clean up bad values and CSS artifacts
        if (value.includes('&') || value.includes('Tile') || value.includes('Packaging') ||
            value.includes('--') || value.includes('css') || value.includes('var(') ||
            value.includes('gradient') || value.includes('preset')) {
          return; // Skip bad values
        }
        
        // Clean color patterns
        if (key.toLowerCase().includes('color') || key.toLowerCase().includes('pattern')) {
          const cleanColor = this.cleanColorPattern(value);
          if (cleanColor) {
            cleanedSpecs[key] = cleanColor;
          }
        } else if (key.toLowerCase().includes('thickness')) {
          // Normalize thickness
          cleanedSpecs[key] = this.normalizeThickness(value);
        } else {
          cleanedSpecs[key] = value;
        }
      }
    });

    // Detect material type from URL for slabs - QUARTZITE FIRST
    if (category === 'slabs') {
      const url = cleanedSpecs['Product URL'] || '';
      // CRITICAL: Check quartzite before quartz to avoid misclassification
      if (url.includes('quartzite')) {
        cleanedSpecs['Material Type'] = 'Natural Quartzite';
        console.log('🎯 QUARTZITE DETECTED from URL - setting Natural Quartzite');
      } else if (url.includes('granite')) {
        cleanedSpecs['Material Type'] = 'Natural Granite';
      } else if (url.includes('marble')) {
        cleanedSpecs['Material Type'] = 'Natural Marble';
      } else if (url.includes('quartz')) {
        cleanedSpecs['Material Type'] = 'Engineered Quartz';
      }
      
      // Extract finish from URL
      if (url.includes('satin')) {
        cleanedSpecs['Finish'] = 'Satin';
      } else if (url.includes('polished')) {
        cleanedSpecs['Finish'] = 'Polished';
      } else if (url.includes('honed')) {
        cleanedSpecs['Finish'] = 'Honed';
      }
    }

    // Category-specific enhancements including Applications, Color, and Dimensions
    const enhancements = {
      tiles: {
        'Material Type': cleanedSpecs['Material Type'] || 'Ceramic',
        'PEI Rating': cleanedSpecs['PEI Rating'] || 'PEI 4',
        'DCOF Rating': cleanedSpecs['DCOF Rating'] || '0.42',
        'Water Absorption': cleanedSpecs['Water Absorption'] || '<0.5%',
        'Finish': cleanedSpecs['Finish'] || 'Matte',
        'Color': cleanedSpecs['Color'] || 'Natural',
        'Thickness': cleanedSpecs['Thickness'] || '10mm',
        'Edge Type': cleanedSpecs['Edge Type'] || 'Rectified',
        'Texture': cleanedSpecs['Texture'] || 'Smooth',
        'Install Location': cleanedSpecs['Install Location'] || 'Floor/Wall',
        'Dimensions': cleanedSpecs['Dimensions'] || cleanedSpecs['Size'] || '12" x 12"',
        'Applications': cleanedSpecs['Applications'] || 'Floor, Wall, Countertop',
        'Available Colors': cleanedSpecs['Available Colors'] || 'Multiple colors available',
        'Available Sizes': cleanedSpecs['Available Sizes'] || 'Multiple sizes available'
      },
      slabs: {
        'Material Type': cleanedSpecs['Material Type'] || 'Natural Stone',
        'Color / Pattern': cleanedSpecs['Color / Pattern'] || cleanedSpecs['Color'] || 'Natural',
        'Finish': cleanedSpecs['Finish'] || 'Polished',
        'Thickness': this.normalizeThickness(cleanedSpecs['Thickness']) || '2cm',
        'Slab Dimensions': cleanedSpecs['Slab Dimensions'] || cleanedSpecs['Dimensions'] || 'Standard size of the slab material, could vary',
        'Edge Type': cleanedSpecs['Edge Type'] || 'Straight',
        'Applications': cleanedSpecs['Applications'] || 'Countertops, Backsplashes, Flooring',
        'Water Absorption': cleanedSpecs['Water Absorption'] || '<0.5%',
        'Scratch / Etch Resistance': cleanedSpecs['Scratch / Etch Resistance'] || cleanedSpecs['Scratch Resistance'] || 'Excellent',
        'Heat Resistance': cleanedSpecs['Heat Resistance'] || 'Heat Resistant',
        'Country of Origin': cleanedSpecs['Country of Origin'] || 'Brazil',
        'Available Colors': cleanedSpecs['Available Colors'] || 'Multiple colors available',
        'Available Sizes': cleanedSpecs['Available Sizes'] || 'Standard slab sizes'
      },
      hardwood: {
        'Species': cleanedSpecs['Species'] || 'Oak',
        'Grade': cleanedSpecs['Grade'] || 'Select',
        'Construction Type': cleanedSpecs['Construction Type'] || 'Solid',
        'Finish': cleanedSpecs['Finish'] || 'Urethane',
        'Janka Hardness': cleanedSpecs['Janka Hardness'] || '1290 lbf',
        'Width': cleanedSpecs['Width'] || '5"',
        'Thickness': cleanedSpecs['Thickness'] || '3/4"',
        'Length': cleanedSpecs['Length'] || 'Random',
        'Installation Method': cleanedSpecs['Installation Method'] || 'Nail/Staple',
        'Color': cleanedSpecs['Color'] || 'Natural',
        'Dimensions': cleanedSpecs['Dimensions'] || cleanedSpecs['Width'] || '5" x 3/4"',
        'Applications': cleanedSpecs['Applications'] || 'Residential, Commercial',
        'Available Colors': cleanedSpecs['Available Colors'] || 'Multiple stain options',
        'Available Sizes': cleanedSpecs['Available Sizes'] || 'Multiple widths available'
      },
      lvt: {
        'Material Type': cleanedSpecs['Material Type'] || 'Luxury Vinyl Tile',
        'Wear Layer': cleanedSpecs['Wear Layer'] || '20 mil',
        'Core Type': cleanedSpecs['Core Type'] || 'SPC',
        'Thickness': cleanedSpecs['Thickness'] || '6mm',
        'Waterproof': cleanedSpecs['Waterproof'] || 'Yes',
        'Installation Method': cleanedSpecs['Installation Method'] || 'Click-Lock',
        'Slip Resistance': cleanedSpecs['Slip Resistance'] || 'R9',
        'Color': cleanedSpecs['Color'] || 'Wood Look',
        'Dimensions': cleanedSpecs['Dimensions'] || cleanedSpecs['Size'] || '6" x 48"',
        'Applications': cleanedSpecs['Applications'] || 'Residential, Commercial',
        'Available Colors': cleanedSpecs['Available Colors'] || 'Multiple wood looks',
        'Available Sizes': cleanedSpecs['Available Sizes'] || 'Plank and tile sizes'
      },
      heat: {
        'Type': cleanedSpecs['Type'] || 'Electric Mat',
        'Voltage': cleanedSpecs['Voltage'] || '240V',
        'Coverage': cleanedSpecs['Coverage'] || cleanedSpecs['Coverage Area'] || '150 sq ft',
        'Power': cleanedSpecs['Power'] || cleanedSpecs['Wattage'] || '1800W',
        'Installation': cleanedSpecs['Installation'] || 'Under-floor',
        'Applications': cleanedSpecs['Applications'] || 'Tile, Stone, Laminate',
        'Dimensions': cleanedSpecs['Dimensions'] || cleanedSpecs['Coverage'] || '150 SF',
        'Available Sizes': cleanedSpecs['Available Sizes'] || 'Multiple coverage areas',
        'Warranty': cleanedSpecs['Warranty'] || '25 years'
      },
      carpet: {
        'Fiber Type': cleanedSpecs['Fiber Type'] || 'Nylon',
        'Pile Style': cleanedSpecs['Pile Style'] || 'Cut Pile',
        'Face Weight': cleanedSpecs['Face Weight'] || '40 oz',
        'Density': cleanedSpecs['Density'] || '3000',
        'Stain Protection': cleanedSpecs['Stain Protection'] || 'Yes',
        'Color': cleanedSpecs['Color'] || 'Neutral',
        'Dimensions': cleanedSpecs['Dimensions'] || cleanedSpecs['Width'] || '12 ft width',
        'Applications': cleanedSpecs['Applications'] || 'Residential, Commercial',
        'Available Colors': cleanedSpecs['Available Colors'] || 'Multiple colors available',
        'Available Sizes': cleanedSpecs['Available Sizes'] || 'Broadloom, tiles available'
      },
      thermostats: {
        'Device Type': cleanedSpecs['Device Type'] || 'Programmable',
        'Voltage': cleanedSpecs['Voltage'] || '120V/240V',
        'Load Capacity': cleanedSpecs['Load Capacity'] || '15A',
        'Sensor Type': cleanedSpecs['Sensor Type'] || 'Floor Sensor',
        'Display Type': cleanedSpecs['Display Type'] || 'Digital',
        'Programmable': cleanedSpecs['Programmable'] || 'Yes',
        'Installation Type': cleanedSpecs['Installation Type'] || 'In-Wall',
        'Color': cleanedSpecs['Color'] || 'White',
        'Dimensions': cleanedSpecs['Dimensions'] || '4.5" x 3.5"',
        'Applications': cleanedSpecs['Applications'] || 'Radiant Floor Heating',
        'Warranty': cleanedSpecs['Warranty'] || '10 years'
      }
    };

    // Apply enhancements based on category
    const categoryEnhancements = enhancements[category as keyof typeof enhancements] || enhancements.tiles;
    
    // Update specifications with enhanced values
    Object.entries(categoryEnhancements).forEach(([key, value]) => {
      specifications[key] = value;
    });

    // Apply material categorization for better identification
    if (specifications['Material Type']) {
      const categorizedMaterial = this.categorizeMaterial(specifications['Material Type'], category);
      specifications['Material Type'] = categorizedMaterial;
      console.log(`🔍 Material categorized: ${specifications['Material Type']}`);
    }

    // Copy over any cleaned specs that weren't enhanced
    Object.entries(cleanedSpecs).forEach(([key, value]) => {
      if (!specifications[key] && value) {
        specifications[key] = value;
      }
    });
    
    // Restore URL-based material type if it exists (highest priority)
    if (urlBasedMaterialType && urlBasedMaterialType.includes('Quartzite')) {
      specifications['Material Type'] = urlBasedMaterialType;
      console.log(`🎯 Final restoration of URL-based material type: ${urlBasedMaterialType}`);
    }
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