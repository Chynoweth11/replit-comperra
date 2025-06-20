// ==========================
// scraper.universal.ts - Universal Scraper for All Other Brands
// ==========================
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeUniversalProduct(url: string, category: string) {
  try {
    const response = await axios.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const html = response.data;

    const name = $('h1').first().text().trim() || 
                $('meta[property="og:title"]').attr('content') || 
                'Product Name Not Found';
    
    let imageUrl = $('meta[property="og:image"]').attr('content') || 
                  $('.product-image img, .hero-image img, .gallery img').first().attr('src') ||
                  $('img').first().attr('src') || '';
    
    if (imageUrl && !imageUrl.startsWith('http')) {
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      else if (imageUrl.startsWith('/')) {
        try {
          const origin = new URL(url).origin;
          imageUrl = origin + imageUrl;
        } catch (e) {
          imageUrl = '';
        }
      }
    }

    const description = $('.product-description, .description, .product-overview')
      .first().text().trim().substring(0, 500) || '';

    // Determine brand from URL
    let brand = 'Unknown';
    const domain = url.toLowerCase();
    if (domain.includes('arizonatile')) brand = 'Arizona Tile';
    else if (domain.includes('floridatile')) brand = 'Florida Tile';
    else if (domain.includes('marazzi')) brand = 'Marazzi';
    else if (domain.includes('shaw')) brand = 'Shaw';
    else if (domain.includes('mohawk')) brand = 'Mohawk';
    else if (domain.includes('cambria')) brand = 'Cambria';
    else if (domain.includes('flor')) brand = 'Flor';
    else if (domain.includes('emser')) brand = 'Emser Tile';

    const specs: any = {
      'Brand': brand,
      'Product URL': url,
      'Category': category
    };

    console.log(`Extracting universal product specifications for ${brand}...`);

    // Smart contextual label-value parsing for universal brands
    function extractSpecsInPairs($: cheerio.CheerioAPI, selector: string): Record<string, string> {
      const results: Record<string, string> = {};
      const elements = $(selector);
      
      for (let i = 0; i < elements.length - 1; i++) {
        const label = $(elements[i]).text().replace(/\s+/g, ' ').trim();
        const value = $(elements[i + 1]).text().replace(/\s+/g, ' ').trim();

        if (
          /pei|dcof|absorption|material|finish|color|edge|install|dimension|texture|location|size|shade|variation|thickness|species|fiber|pile/i.test(label) &&
          value !== '—' && value !== '' && value !== label &&
          value.length > 0 && value.length < 100
        ) {
          console.log(`Universal smart extraction: ${label} = ${value}`);
          results[label] = value;
        }
      }
      return results;
    }

    // Universal extraction from structured data with smart parsing
    const smartSpecs = extractSpecsInPairs($, '.product-detail-specs li, table td, .specifications div, .spec-item, ul li, .specs div');
    
    // Legacy extraction for colon-separated values
    $('table, ul, li, div, span, .specs, .specifications, .product-specs').each((_, el) => {
      const text = $(el).text();
      const match = text.split(':');
      if (match.length === 2) {
        const key = match[0].trim();
        const value = match[1].trim();
        
        if (key && value && key.length < 50 && value.length < 100 && !smartSpecs[key]) {
          smartSpecs[key] = value;
        }
      }
    });

    // Map common field variations
    Object.keys(smartSpecs).forEach(key => {
      const value = smartSpecs[key];
      if (/pei/i.test(key)) {
        const peiValue = value.match(/([0-5])/);
        if (peiValue) specs['PEI Rating'] = peiValue[1];
      } else if (/color/i.test(key)) {
        specs['Color'] = value;
      } else if (/finish|surface/i.test(key)) {
        specs['Finish'] = value;
      } else if (/size|dimension/i.test(key)) {
        specs['Dimensions'] = value;
      } else if (/material|type/i.test(key)) {
        specs['Material Type'] = value;
      } else if (/thickness/i.test(key)) {
        specs['Thickness'] = value;
      } else if (/absorption/i.test(key)) {
        specs['Water Absorption'] = value;
      } else if (/slip|dcof|cof/i.test(key)) {
        specs['DCOF / Slip Rating'] = value;
      } else {
        specs[key] = value;
      }
    });

    // Enhanced regex extraction from page content
    const bodyText = $('body').text();
    const fullText = `${bodyText} ${html}`;

    // Material type detection
    if (!specs['Material Type']) {
      const materialMatch = fullText.match(/(Porcelain|Ceramic|Natural Stone|Quartz|Granite|Marble|Limestone|Travertine|Slate|LVT|Vinyl|Hardwood|Oak|Maple|Nylon|Wool)/i);
      if (materialMatch) specs['Material Type'] = materialMatch[1];
    }

    // Generic finish detection
    if (!specs['Finish']) {
      const finishMatch = fullText.match(/(Glossy|Matte|Polished|Honed|Textured|Lappato|Satin|Natural|Brushed|Antique)/i);
      if (finishMatch) specs['Finish'] = finishMatch[1];
    }

    // Generic color detection
    if (!specs['Color']) {
      const colorMatch = fullText.match(/(White|Black|Gray|Grey|Blue|Navy|Beige|Brown|Green|Red|Cream|Tan|Oak|Cherry|Walnut)/i);
      if (colorMatch) specs['Color'] = colorMatch[1];
    }

    // Generic dimensions
    if (!specs['Dimensions']) {
      const dimMatch = fullText.match(/(\d+["']?\s*[xX×]\s*\d+["']?(?:\s*[xX×]\s*\d+["']?)?)/);
      if (dimMatch) specs['Dimensions'] = dimMatch[1];
    }

    // Generic price extraction
    let price = '0.00';
    const priceMatch = fullText.match(/\$\s?([\d,]+\.?\d*)\s?\/?\s?(?:SF|sq\.?\s?ft|per\s?sq|square)/i);
    if (priceMatch) {
      price = priceMatch[1].replace(',', '');
      specs['Price per SF'] = price;
    }

    console.log(`Final ${brand} specifications:`, {
      'Material Type': specs['Material Type'] || '—',
      'Color': specs['Color'] || '—',
      'Finish': specs['Finish'] || '—', 
      'Dimensions': specs['Dimensions'] || '—'
    });

    return {
      name,
      brand,
      price,
      category,
      description,
      imageUrl,
      dimensions: specs['Dimensions'] || '—',
      specifications: specs,
      sourceUrl: url
    };

  } catch (error) {
    console.error(`Error scraping universal product ${url}:`, error);
    return null;
  }
}