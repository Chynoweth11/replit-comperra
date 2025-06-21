// ==========================
// gpt-specs.ts — Auto-Specs from URL
// ==========================
import axios from 'axios';
import * as cheerio from 'cheerio';

// Note: OpenAI integration would require API key and package installation
// This is a placeholder implementation for the GPT-based extraction concept

export async function extractSpecsWithGPT(url: string): Promise<Record<string, string>> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    const rawText = $('body').text().replace(/\s+/g, ' ').slice(0, 16000);

    // For now, return empty object since OpenAI package is not installed
    // This would be the implementation if OpenAI API key was configured:
    /*
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const prompt = `Extract a clean JSON object with the following product specs from this text:
    - Product URL
    - Brand
    - Category
    - PEI Rating
    - DCOF / Slip Rating
    - Water Absorption
    - Material Type
    - Finish
    - Color
    - Edge Type
    - Install Location
    - Coverage
    - Applications
    - Dimensions
    - Texture
    - Price per SF

    Text:
    ${rawText}`;

    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = chat.choices[0].message.content;
    const parsed = JSON.parse(responseText || '{}');
    parsed['Product URL'] = url;
    return parsed;
    */

    console.log('GPT-based extraction would be used here with OpenAI API');
    return {
      'Product URL': url,
      'Brand': 'GPT-Extracted',
      'Note': 'OpenAI integration requires API key configuration'
    };
  } catch (err) {
    console.error('GPT Spec Error:', err);
    return {};
  }
}