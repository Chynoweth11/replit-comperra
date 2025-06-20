// ==========================
// scraper.daltile.ts - Enhanced Daltile Scraper
// ==========================
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeDaltileProduct(url: string, category: string) {
  try {
    const response = await axios.get(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' 
      },
      timeout: 15000
    });
    
    const $ = cheerio.load(response.data);
    const html = response.data;

    const name = $('h1.product-title, h1.pdp-product-name, .product-name h1, h1').first().text().trim() || 'Product Name Not Found';
    
    let imageUrl = $('img.product-image, .product-photo img, .hero-image img, .pdp-image img, img[alt*="product"]')
      .first().attr('src') || 
      $('meta[property="og:image"]').attr('content') ||
      $('img').first().attr('src') || '';
    
    if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
    if (imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
      imageUrl = 'https://www.daltile.com' + imageUrl;
    }

    const description = $('.product-description, .description, .product-overview, .pdp-description')
      .first().text().trim().substring(0, 500) || '';

    const specs: any = {
      'Brand': 'Daltile',
      'Product URL': url,
      'Category': category
    };

    console.log('Extracting Daltile product specifications...');

    // Extract from specification tables and structured data
    $('table.specs, .specification-item, .spec-row, .product-specs tr, .specs-table tr, .technical-specs tr').each((_, elem) => {
      const key = $(elem).find('.spec-label, .label, td:first-child, th').text().trim();
      const value = $(elem).find('.spec-value, .value, td:last-child').text().trim();
      if (key && value && key !== value) {
        specs[key] = value;
      }
    });

    // Enhanced regex-based extraction from full page content
    const bodyText = $('body').text();
    const fullText = `${bodyText} ${html}`;

    // Universal specification extraction
    
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

    // Enhanced dimensions extraction
    let dimensions = $('.size, .dimensions, .product-size, .tile-size, .nominal-size').text().trim() || '';
    if (!dimensions) {
      const dimMatch = fullText.match(/(?:Size|Dimension|Nominal)s?:?\s*(\d+["']?\s*[xX×]\s*\d+["']?(?:\s*[xX×]\s*\d+["']?)?)/i) ||
                      fullText.match(/(\d+["']?\s*[xX×]\s*\d+["']?)/);
      if (dimMatch) dimensions = dimMatch[1];
    }
    specs['Dimensions'] = dimensions;
    
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
    
    if (price === '0.00') {
      const priceMatch = fullText.match(/\$\s?([\d,]+\.?\d*)\s?\/?\s?(?:SF|sq\.?\s?ft|per\s?sq|square)/i);
      if (priceMatch) price = priceMatch[1].replace(',', '');
    }
    
    specs['Price per SF'] = price;

    console.log('Final Daltile specifications:', {
      'PEI Rating': specs['PEI Rating'] || '—',
      'Color': specs['Color'] || '—', 
      'Finish': specs['Finish'] || '—',
      'Dimensions': specs['Dimensions'] || '—',
      'Material Type': specs['Material Type'] || '—'
    });

    return {
      name,
      brand: 'Daltile',
      price,
      category,
      description,
      imageUrl,
      dimensions: specs['Dimensions'] || '—',
      specifications: specs,
      sourceUrl: url
    };

  } catch (error) {
    console.error(`Error scraping Daltile product ${url}:`, error);
    return null;
  }
}