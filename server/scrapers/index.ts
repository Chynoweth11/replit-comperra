// ==========================
// index.ts - Entry Point
// ==========================
import { preprocessURL } from './preprocessor';
import { scrapeMSIProduct } from './scraper.msi';
import { scrapeDaltileProduct } from './scraper.daltile';
import { scrapeUniversalProduct } from './scraper.universal';
import { normalizeSpecs } from './normalizer';

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