// ==========================
// preprocessor.ts
// ==========================
export async function preprocessURL(url: string): Promise<{ brand: string; category: string }> {
  const domain = new URL(url).hostname.toLowerCase();

  const brandMap: Record<string, string> = {
    'msisurfaces.com': 'MSI',
    'daltile.com': 'Daltile',
    'arizonatile.com': 'Arizona Tile',
    'florida.tile': 'Florida Tile',
    'marazziusa.com': 'Marazzi',
    'shawfloors.com': 'Shaw',
    'cambriausa.com': 'Cambria',
    'flor.com': 'Flor',
    'mohawkflooring.com': 'Mohawk',
    'emser.com': 'Emser Tile'
  };

  let brand = 'Unknown';
  for (const domainKey in brandMap) {
    if (domain.includes(domainKey)) {
      brand = brandMap[domainKey];
      break;
    }
  }

  let category = 'tiles';
  const urlLower = url.toLowerCase();
  if (urlLower.includes('slab') || urlLower.includes('quartz') || urlLower.includes('marble')) category = 'slabs';
  else if (urlLower.includes('lvt') || urlLower.includes('vinyl')) category = 'lvt';
  else if (urlLower.includes('hardwood')) category = 'hardwood';
  else if (urlLower.includes('carpet')) category = 'carpet';
  else if (urlLower.includes('heat') || urlLower.includes('thermostat')) category = 'heat';

  return { brand, category };
}