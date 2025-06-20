// ==========================
// scraper.msi.ts - Enhanced MSI Scraper
// ==========================
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeMSIProduct(url: string, category: string) {
  try {
    const response = await axios.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const html = response.data;

    const name = $('h1').first().text().trim() || 'Product Name Not Found';
    
    let imageUrl = $('meta[property="og:image"]').attr('content') || 
                   $('.carousel-item img').first().attr('src') || 
                   $('.product-image img').first().attr('src') || '';
    
    if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
    if (imageUrl.startsWith('/')) imageUrl = 'https://www.msisurfaces.com' + imageUrl;

    const description = $('.product-intro p, .product-description').first().text().trim().substring(0, 500) || '';

    // Enhanced MSI specification extraction with direct HTML pattern matching
    const specs: any = {
      'Brand': 'MSI',
      'Product URL': url,
      'Category': category,
      'Material Type': 'Porcelain'
    };

    console.log('Extracting MSI product specifications...');

    // Universal Key-Value Parser (like ChatGPT uses internally)
    function extractStructuredSpecs(rawHtml: string): Record<string, string> {
      const specs: Record<string, string> = {};
      const lines = rawHtml
        .replace(/<[^>]+>/g, '') // strip HTML tags
        .replace(/\\n+/g, '\n')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      for (let i = 0; i < lines.length; i++) {
        const label = lines[i].toLowerCase();

        // Detect and pair lines
        if (label.includes('pei') && !specs['PEI Rating']) {
          const nextLine = lines[i + 1];
          if (nextLine && /[0-5]/.test(nextLine)) {
            specs['PEI Rating'] = nextLine.match(/([0-5])/)?.[1] || '—';
          }
        }
        if ((label.includes('dcof') || label.includes('slip')) && !specs['DCOF / Slip Rating']) {
          specs['DCOF / Slip Rating'] = lines[i + 1] || '—';
        }
        if (label.includes('absorption') && !specs['Water Absorption']) {
          specs['Water Absorption'] = lines[i + 1] || '—';
        }
        if (label.includes('material') && !specs['Material Type']) {
          specs['Material Type'] = lines[i + 1] || '—';
        }
        if (label.includes('finish') && !specs['Finish']) {
          specs['Finish'] = lines[i + 1] || '—';
        }
        if ((label.includes('color') || label.includes('primary color')) && !specs['Color']) {
          const nextLine = lines[i + 1];
          if (nextLine && !nextLine.toLowerCase().includes('color') && nextLine !== '—') {
            specs['Color'] = nextLine;
          }
        }
        if (label.includes('edge') && !specs['Edge Type']) {
          specs['Edge Type'] = lines[i + 1] || '—';
        }
        if (label.includes('install') && !specs['Install Location']) {
          specs['Install Location'] = lines[i + 1] || '—';
        }
        if ((label.includes('dimension') || label.includes('size')) && !specs['Dimensions']) {
          const nextLine = lines[i + 1];
          if (nextLine && /\d+.*x.*\d+/.test(nextLine)) {
            specs['Dimensions'] = nextLine;
          }
        }
        if (label.includes('texture') && !specs['Texture']) {
          specs['Texture'] = lines[i + 1] || '—';
        }
        if (label.includes('shade') && !specs['Shade Variation']) {
          specs['Shade Variation'] = lines[i + 1] || '—';
        }
      }

      return specs;
    }

    // Extract specifications using the universal parser
    const universalSpecs = extractStructuredSpecs(html);
    Object.assign(specs, universalSpecs);

    console.log('Universal parser extracted:', universalSpecs);

    // Direct HTML string extraction for MSI's exact structure
    // PEI Rating extraction
    let peiMatch = html.match(/<div class='specs-heading'><span>PEI RATING<\/span><\/div><div class='specs-label'><span>([0-5])<\/span><\/div>/i);
    if (peiMatch) {
      specs['PEI Rating'] = peiMatch[1];
      console.log(`Found PEI Rating: ${peiMatch[1]}`);
    }

    // Primary Color extraction  
    let colorMatch = html.match(/<div class='specs-heading'><span>Primary Color\(s\)<\/span><\/div><div class='specs-label'><span>([^<]+)<\/span><\/div>/i);
    if (colorMatch) {
      specs['Color'] = colorMatch[1];
      console.log(`Found Color: ${colorMatch[1]}`);
    }

    // Tile Type (Finish) extraction
    let finishMatch = html.match(/<div class='specs-heading'><span>Tile Type<\/span><\/div><div class='specs-label'><span>([^<]+)<\/span><\/div>/i);
    if (finishMatch) {
      specs['Finish'] = finishMatch[1];
      console.log(`Found Finish: ${finishMatch[1]}`);
    }

    // Shade Variation extraction
    let shadeMatch = html.match(/<div class='specs-heading'><span>Shade Variations<\/span><\/div><div class='specs-label'><span>([^<]+)<\/span><\/div>/i);
    if (shadeMatch) {
      specs['Shade Variation'] = shadeMatch[1];
      console.log(`Found Shade Variation: ${shadeMatch[1]}`);
    }

    // Size extraction from item details
    let sizeMatch = html.match(/Item Size:<\/strong>\s*([^<]+)/i);
    if (sizeMatch) {
      specs['Dimensions'] = sizeMatch[1].trim();
      console.log(`Found Size: ${sizeMatch[1].trim()}`);
    }

    // Applications extraction for install location
    const applications = [];
    if (/Flooring.*?Residential.*?Yes/i.test(html)) applications.push('Floor');
    if (/Wall.*?Residential.*?Yes/i.test(html)) applications.push('Wall'); 
    if (/Countertops.*?Residential.*?Yes/i.test(html)) applications.push('Countertop');
    if (applications.length > 0) {
      specs['Install Location'] = applications.join(', ');
      specs['Applications'] = applications.join(', ');
      console.log(`Found Applications: ${applications.join(', ')}`);
    }

    // Smart contextual label-value parsing
    function extractSpecsInPairs($: cheerio.CheerioAPI, selector: string): Record<string, string> {
      const results: Record<string, string> = {};
      const elements = $(selector);
      
      for (let i = 0; i < elements.length - 1; i++) {
        const label = $(elements[i]).text().replace(/\s+/g, ' ').trim();
        const value = $(elements[i + 1]).text().replace(/\s+/g, ' ').trim();

        if (
          /pei|dcof|absorption|material|finish|color|edge|install|dimension|texture|location|size|shade|variation/i.test(label) &&
          value !== '—' && value !== '' && value !== label &&
          value.length > 0 && value.length < 100
        ) {
          console.log(`Smart extraction found: ${label} = ${value}`);
          results[label] = value;
        }
      }
      return results;
    }

    // Enhanced fallback extraction using smart parsing
    const smartSpecs = extractSpecsInPairs($, '.product-detail-specs li, table td, .specifications div, .spec-item, ul.list-unstyled li, .tab-content li');
    
    // Normalize and map extracted specs
    function remapSpecs(specs: Record<string, string>): Record<string, string> {
      const map: Record<string, string> = {
        'P E I Rating': 'PEI Rating',
        'PEI RATING': 'PEI Rating', 
        'D C O F / Slip Rating': 'DCOF / Slip Rating',
        'DCOF': 'DCOF / Slip Rating',
        'Water Absorption': 'Water Absorption',
        'Finish': 'Finish',
        'Tile Type': 'Finish',
        'Material Type': 'Material Type',
        'Edge Type': 'Edge Type',
        'Install Location': 'Install Location',
        'Dimensions': 'Dimensions',
        'Size': 'Dimensions',
        'Item Size': 'Dimensions',
        'Color': 'Color',
        'Primary Color(s)': 'Color',
        'Texture': 'Texture',
        'Shade Variations': 'Shade Variation'
      };

      const normalized: Record<string, string> = {};
      for (const key in specs) {
        const newKey = map[key] || key;
        if (!normalized[newKey]) {  // Don't overwrite existing values
          normalized[newKey] = specs[key];
        }
      }
      return normalized;
    }

    const remappedSpecs = remapSpecs(smartSpecs);
    Object.assign(specs, remappedSpecs);

    // Price extraction
    let price = '0.00';
    const priceMatch = html.match(/\$\s?([\d,]+\.?\d*)\s?\/?\s?(?:SF|sq\.?\s?ft)/i);
    if (priceMatch) {
      price = priceMatch[1].replace(',', '');
      specs['Price per SF'] = price;
    }

    // Add missing required fields
    specs['Brand'] = 'MSI';
    specs['Product URL'] = url;
    if (!specs['Price per SF']) specs['Price per SF'] = price;

    console.log('Final MSI specifications:', {
      'PEI Rating': specs['PEI Rating'] || '—',
      'Color': specs['Color'] || '—',
      'Finish': specs['Finish'] || '—',
      'Dimensions': specs['Dimensions'] || '—',
      'Applications': specs['Applications'] || '—',
      'Material Type': specs['Material Type'] || 'Porcelain'
    });

    return {
      name,
      brand: 'MSI',
      price,
      category,
      description,
      imageUrl,
      dimensions: specs['Dimensions'] || '—',
      specifications: specs,
      sourceUrl: url
    };

  } catch (error) {
    console.error(`Error scraping MSI product ${url}:`, error);
    return null;
  }
}