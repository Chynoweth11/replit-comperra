// ==========================
// index.ts - Entry Point
// ==========================
import { preprocessURL } from './preprocessor.js';
import { scrapeMSIProduct } from './scraper.msi.js';
import { scrapeDaltileProduct } from './scraper.daltile.js';
import { scrapeUniversalProduct } from './scraper.universal.js';
import { normalizeSpecs } from './normalizer.js';

export async function scrapeProduct(url: string) {
  const { brand, category } = await preprocessURL(url);
  let result = null;

  switch (brand) {
    case 'MSI':
      result = await scrapeMSIProduct(url, category);
      break;
    case 'Daltile':
      result = await scrapeDaltileProduct(url, category);
      break;
    default:
      result = await scrapeUniversalProduct(url, category);
  }

  if (result) {
    result.specifications = normalizeSpecs(result.specifications);
  }

  return result;
}