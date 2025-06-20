// ==========================
// normalizer.ts
// ==========================
export function normalizeSpecs(specs: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(specs)) {
    const cleanKey = key.trim();
    const cleanValue = value.replace(/\s+/g, ' ').trim();
    if (cleanValue && cleanValue !== '—') {
      normalized[cleanKey] = cleanValue;
    }
  }

  const defaults = [
    'Brand', 'Dimensions', 'Finish', 'Material Type', 'PEI Rating', 'DCOF / Slip Rating',
    'Water Absorption', 'Coverage', 'Applications', 'Product URL'
  ];

  for (const field of defaults) {
    if (!normalized[field]) {
      normalized[field] = '—';
    }
  }

  return normalized;
}