// ==========================
// scraper.msi.ts (Fixed with visual key-value extraction)
// ==========================
import axios from 'axios';
import * as cheerio from 'cheerio';

function extractAlternatingSpecs($: cheerio.CheerioAPI, selector: string): Record<string, string> {
  const results: Record<string, string> = {};
  const items = $(selector);
  for (let i = 0; i < items.length; i += 2) {
    const key = $(items[i]).text().replace(/\s+/g, ' ').trim();
    const value = $(items[i + 1])?.text().replace(/\s+/g, ' ').trim() || '—';
    if (key && value && value !== 'Downloads' && value !== 'Real Projects' && value !== 'Check Inventory' && !results[key]) {
      console.log(`MSI alternating extraction: ${key} = ${value}`);
      results[key] = value;
    }
  }
  return results;
}

function remapSpecs(rawSpecs: Record<string, string>): Record<string, string> {
  const map: Record<string, string> = {
    'P E I Rating': 'PEI Rating',
    'PEI RATING': 'PEI Rating',
    'D C O F / Slip Rating': 'DCOF / Slip Rating',
    'DCOF': 'DCOF / Slip Rating',
    'Water Absorption': 'Water Absorption',
    'Material Type': 'Material Type',
    'Finish': 'Finish',
    'Tile Type': 'Finish',
    'Color': 'Color',
    'Primary Color(s)': 'Color',
    'Edge Type': 'Edge Type',
    'Install Location': 'Install Location',
    'Dimensions': 'Dimensions',
    'Size': 'Dimensions',
    'Item Size': 'Dimensions',
    'Texture': 'Texture',
    'Applications': 'Applications',
    'Coverage': 'Coverage',
    'Shade Variations': 'Shade Variation',
    'Shade Variation': 'Shade Variation'
  };

  const final: Record<string, string> = {};
  for (const key in rawSpecs) {
    const mapped = map[key] || key;
    if (rawSpecs[key] && rawSpecs[key] !== '—') {
      final[mapped] = rawSpecs[key];
    }
  }
  return final;
}

export async function scrapeMSIProduct(url: string, category: string) {
  try {
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
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

    console.log('Extracting MSI product specifications...');

    // Extract using alternating key-value pairs
    const rawSpecs = extractAlternatingSpecs($, '.product-detail-specs li');
    const specs = remapSpecs(rawSpecs);

    // Add core fields
    specs['Product URL'] = url;
    specs['Brand'] = 'MSI';
    specs['Category'] = category;
    specs['Price per SF'] = '0.00';

    // Enhanced direct HTML extraction for key MSI fields
    let peiMatch = html.match(/<div class='specs-heading'><span>PEI RATING<\/span><\/div><div class='specs-label'><span>([0-5])<\/span><\/div>/i);
    if (peiMatch && !specs['PEI Rating']) {
      specs['PEI Rating'] = peiMatch[1];
      console.log(`Found PEI Rating: ${peiMatch[1]}`);
    }

    let colorMatch = html.match(/<div class='specs-heading'><span>Primary Color\(s\)<\/span><\/div><div class='specs-label'><span>([^<]+)<\/span><\/div>/i);
    if (colorMatch && !specs['Color']) {
      specs['Color'] = colorMatch[1];
      console.log(`Found Color: ${colorMatch[1]}`);
    }

    let finishMatch = html.match(/<div class='specs-heading'><span>Tile Type<\/span><\/div><div class='specs-label'><span>([^<]+)<\/span><\/div>/i);
    if (finishMatch && !specs['Finish']) {
      specs['Finish'] = finishMatch[1];
      console.log(`Found Finish: ${finishMatch[1]}`);
    }

    // Applications extraction
    const applications = [];
    if (/Flooring.*?Residential.*?Yes/i.test(html)) applications.push('Floor');
    if (/Wall.*?Residential.*?Yes/i.test(html)) applications.push('Wall'); 
    if (/Countertops.*?Residential.*?Yes/i.test(html)) applications.push('Countertop');
    if (applications.length > 0) {
      specs['Install Location'] = applications.join(', ');
      specs['Applications'] = applications.join(', ');
    }

    // Fallbacks for missing critical fields with better dimension extraction
    if (!specs['Dimensions']) {
      // Try multiple selectors for dimensions
      let dimensions = $('.product-detail-sizes span').first().text().trim() ||
                      $('.product-sizes span').first().text().trim() ||
                      $('[data-size]').first().text().trim() ||
                      $('.size-option').first().text().trim();
      
      // If still empty, try regex extraction from HTML
      if (!dimensions) {
        const sizeMatch = html.match(/(\d+["']?\s*[xX×]\s*\d+["']?)/);
        if (sizeMatch) {
          dimensions = sizeMatch[1];
        }
      }
      
      // Clean up dimension text
      if (dimensions && dimensions.length < 50) {
        specs['Dimensions'] = dimensions.replace(/\s+/g, ' ').trim();
      } else {
        specs['Dimensions'] = '—';
      }
    }
    
    if (!specs['Coverage']) {
      specs['Coverage'] = $('div:contains("Coverage")').next().text().trim() || 
                         $('div:contains("sq ft")').text().match(/[\d.]+\s*sq\s*ft/i)?.[0] || '—';
    }

    if (!specs['Material Type']) {
      specs['Material Type'] = 'Porcelain';
    }

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
      price: specs['Price per SF'] || '0.00',
      category,
      description: $('.product-intro p, .product-description').first().text().trim().substring(0, 500) || '',
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