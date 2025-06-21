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

    // Universal Key-Value Parser for all brands
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

        if (label.includes('pei') && !specs['PEI Rating']) {
          const nextLine = lines[i + 1];
          if (nextLine && /[0-5]/.test(nextLine)) {
            specs['PEI Rating'] = nextLine.match(/([0-5])/)?.[1] || '—';
          }
        }
        if ((label.includes('dcof') || label.includes('slip') || label.includes('cof')) && !specs['DCOF / Slip Rating']) {
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
        if (label.includes('color') && !specs['Color']) {
          const nextLine = lines[i + 1];
          if (nextLine && !nextLine.toLowerCase().includes('color') && nextLine !== '—') {
            specs['Color'] = nextLine;
          }
        }
        if (label.includes('edge') && !specs['Edge Type']) {
          specs['Edge Type'] = lines[i + 1] || '—';
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
        if (label.includes('species') && !specs['Wood Species']) {
          specs['Wood Species'] = lines[i + 1] || '—';
        }
        if (label.includes('fiber') && !specs['Fiber Type']) {
          specs['Fiber Type'] = lines[i + 1] || '—';
        }
        if (label.includes('pile') && !specs['Pile Style']) {
          specs['Pile Style'] = lines[i + 1] || '—';
        }
        if (label.includes('janka') && !specs['Hardness (Janka)']) {
          specs['Hardness (Janka)'] = lines[i + 1] || '—';
        }
        if (label.includes('voltage') && !specs['Voltage']) {
          specs['Voltage'] = lines[i + 1] || '—';
        }
        if (label.includes('coverage') && !specs['Coverage Area (SF)']) {
          specs['Coverage Area (SF)'] = lines[i + 1] || '—';
        }
      }

      return specs;
    }

    // Extract specifications using the universal parser
    const universalSpecs = extractStructuredSpecs(html);
    Object.assign(specs, universalSpecs);

    console.log(`${brand} universal parser extracted:`, universalSpecs);

    // Alternating specs extraction for universal brands
    function extractAlternatingSpecs($: cheerio.CheerioAPI, selector: string): Record<string, string> {
      const results: Record<string, string> = {};
      const items = $(selector);

      for (let i = 0; i < items.length; i += 2) {
        const key = $(items[i]).text().replace(/\s+/g, ' ').trim();
        const value = $(items[i + 1])?.text().replace(/\s+/g, ' ').trim() || '—';

        if (key && !results[key]) {
          console.log(`Universal alternating extraction: ${key} = ${value}`);
          results[key] = value;
        }
      }

      return results;
    }

    // Universal extraction from structured data with alternating parsing
    const smartSpecs = extractAlternatingSpecs($, '.product-detail-specs li, table td, .specifications div, .spec-item, ul li, .specs div');
    
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