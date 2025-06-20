// Central definition of specifications required per material category
// Used for dynamic comparisons, scraping expectations, and form field generation

export interface SpecificationField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'url';
  required: boolean;
  options?: string[];
}

export const MATERIAL_SPECIFICATIONS: Record<string, SpecificationField[]> = {
  tiles: [
    { key: 'name', label: 'Product Name', type: 'text', required: true },
    { key: 'brand', label: 'Brand', type: 'text', required: true },
    { key: 'price', label: 'Price per SF', type: 'number', required: true },
    { key: 'dimensions', label: 'Size', type: 'text', required: true },
    { key: 'peiRating', label: 'PEI Rating', type: 'select', required: true, options: ['1', '2', '3', '4', '5'] },
    { key: 'slipRating', label: 'DCOF / Slip Rating', type: 'text', required: true },
    { key: 'waterAbsorption', label: 'Water Absorption', type: 'text', required: true },
    { key: 'finish', label: 'Finish', type: 'select', required: true, options: ['Matte', 'Glossy', 'Polished', 'Honed', 'Textured', 'Satin'] },
    { key: 'materialType', label: 'Material Type', type: 'select', required: true, options: ['Porcelain', 'Ceramic', 'Natural Stone', 'Glass', 'Mosaic'] },
    { key: 'edgeType', label: 'Edge Type', type: 'select', required: false, options: ['Rectified', 'Pressed', 'Natural'] },
    { key: 'installLocation', label: 'Install Location', type: 'select', required: false, options: ['Floor', 'Wall', 'Both', 'Exterior'] },
    { key: 'color', label: 'Color', type: 'text', required: false },
    { key: 'texture', label: 'Texture', type: 'text', required: false },
    { key: 'sourceUrl', label: 'Product URL', type: 'url', required: false }
  ],
  slabs: [
    { key: 'name', label: 'Product Name', type: 'text', required: true },
    { key: 'brand', label: 'Brand', type: 'text', required: true },
    { key: 'materialType', label: 'Material Type', type: 'select', required: true, options: ['Engineered Quartz', 'Natural Granite', 'Natural Marble', 'Ultra-Compact', 'Natural Quartz'] },
    { key: 'finish', label: 'Finish', type: 'select', required: true, options: ['Polished', 'Honed', 'Leathered', 'Brushed', 'Satin'] },
    { key: 'colorPattern', label: 'Color Pattern', type: 'text', required: false },
    { key: 'thickness', label: 'Thickness', type: 'text', required: true },
    { key: 'dimensions', label: 'Slab Size', type: 'text', required: true },
    { key: 'waterAbsorption', label: 'Water Absorption', type: 'text', required: false },
    { key: 'scratchResistance', label: 'Scratch Resistance', type: 'text', required: false },
    { key: 'applications', label: 'Applications', type: 'text', required: false },
    { key: 'price', label: 'Price per SF', type: 'number', required: true },
    { key: 'sourceUrl', label: 'Product URL', type: 'url', required: false }
  ],
  lvt: [
    { key: 'name', label: 'Product Name', type: 'text', required: true },
    { key: 'brand', label: 'Brand', type: 'text', required: true },
    { key: 'wearLayer', label: 'Wear Layer', type: 'text', required: true },
    { key: 'thickness', label: 'Total Thickness', type: 'text', required: true },
    { key: 'finish', label: 'Finish', type: 'select', required: false, options: ['Matte', 'Satin', 'Gloss', 'Textured'] },
    { key: 'dimensions', label: 'Plank Size', type: 'text', required: true },
    { key: 'waterproof', label: 'Waterproof Rating', type: 'boolean', required: true },
    { key: 'installation', label: 'Installation Method', type: 'select', required: true, options: ['Click Lock', 'Glue Down', 'Loose Lay'] },
    { key: 'underlaymentIncluded', label: 'Underlayment Included', type: 'boolean', required: false },
    { key: 'slipResistance', label: 'Slip Resistance', type: 'text', required: false },
    { key: 'applicationZones', label: 'Application Zones', type: 'text', required: false },
    { key: 'warranty', label: 'Warranty', type: 'text', required: false },
    { key: 'price', label: 'Price per SF', type: 'number', required: true },
    { key: 'sourceUrl', label: 'Product URL', type: 'url', required: false }
  ],
  hardwood: [
    { key: 'name', label: 'Product Name', type: 'text', required: true },
    { key: 'brand', label: 'Brand', type: 'text', required: true },
    { key: 'species', label: 'Wood Species', type: 'select', required: true, options: ['Oak', 'Maple', 'Cherry', 'Walnut', 'Hickory', 'Ash', 'Pine', 'Bamboo'] },
    { key: 'finish', label: 'Finish', type: 'select', required: true, options: ['Prefinished', 'Unfinished', 'Hand-scraped', 'Wire-brushed'] },
    { key: 'materialType', label: 'Construction', type: 'select', required: true, options: ['Solid Hardwood', 'Engineered Hardwood', 'Laminate'] },
    { key: 'dimensions', label: 'Plank Dimensions', type: 'text', required: true },
    { key: 'thickness', label: 'Thickness', type: 'text', required: true },
    { key: 'hardness', label: 'Hardness (Janka)', type: 'text', required: false },
    { key: 'installation', label: 'Installation Method', type: 'select', required: false, options: ['Nail Down', 'Glue Down', 'Float', 'Staple'] },
    { key: 'moistureResistance', label: 'Moisture Resistance', type: 'text', required: false },
    { key: 'price', label: 'Price per SF', type: 'number', required: true },
    { key: 'sourceUrl', label: 'Product URL', type: 'url', required: false }
  ],
  heat: [
    { key: 'name', label: 'Product Name', type: 'text', required: true },
    { key: 'brand', label: 'Brand', type: 'text', required: true },
    { key: 'materialType', label: 'Type', type: 'select', required: true, options: ['Electric Cable', 'Electric Mat', 'Hydronic', 'Membrane System'] },
    { key: 'voltage', label: 'Voltage', type: 'select', required: true, options: ['120V', '240V', 'N/A'] },
    { key: 'coverage', label: 'Coverage Area (SF)', type: 'text', required: true },
    { key: 'wattage', label: 'Wattage', type: 'text', required: false },
    { key: 'sensorType', label: 'Sensor Type', type: 'text', required: false },
    { key: 'thermostat', label: 'Thermostat Included', type: 'text', required: false },
    { key: 'maxTemp', label: 'Max Temperature', type: 'text', required: false },
    { key: 'programmable', label: 'Programmable', type: 'boolean', required: false },
    { key: 'installation', label: 'Install Location', type: 'select', required: true, options: ['Under Tile', 'Under Laminate', 'In Concrete', 'Under Stone'] },
    { key: 'price', label: 'Price per SF', type: 'number', required: true },
    { key: 'sourceUrl', label: 'Product URL', type: 'url', required: false }
  ],
  carpet: [
    { key: 'name', label: 'Product Name', type: 'text', required: true },
    { key: 'brand', label: 'Brand', type: 'text', required: true },
    { key: 'fiberType', label: 'Fiber Type', type: 'select', required: true, options: ['Nylon', 'Polyester', 'Wool', 'Triexta', 'Polypropylene'] },
    { key: 'construction', label: 'Pile Style', type: 'select', required: true, options: ['Cut Pile', 'Loop Pile', 'Cut & Loop', 'Berber', 'Frieze'] },
    { key: 'faceWeight', label: 'Face Weight', type: 'text', required: false },
    { key: 'density', label: 'Density', type: 'text', required: true },
    { key: 'backing', label: 'Backing', type: 'text', required: false },
    { key: 'stainResistance', label: 'Stain Protection', type: 'text', required: true },
    { key: 'trafficRating', label: 'Traffic Rating', type: 'select', required: false, options: ['Light', 'Medium', 'Heavy', 'Commercial'] },
    { key: 'dimensions', label: 'Roll Width', type: 'text', required: true },
    { key: 'installation', label: 'Install Type', type: 'select', required: false, options: ['Stretch-in', 'Glue Down', 'Tile'] },
    { key: 'price', label: 'Price per SF', type: 'number', required: true },
    { key: 'sourceUrl', label: 'Product URL', type: 'url', required: false }
  ]
};

export const getCategorySpecifications = (category: string): SpecificationField[] => {
  return MATERIAL_SPECIFICATIONS[category] || [];
};

export const getRequiredFields = (category: string): string[] => {
  const specs = getCategorySpecifications(category);
  return specs.filter(spec => spec.required).map(spec => spec.key);
};

export const getFieldsByType = (category: string, type: SpecificationField['type']): SpecificationField[] => {
  const specs = getCategorySpecifications(category);
  return specs.filter(spec => spec.type === type);
};

export const validateMaterialData = (category: string, data: any): { isValid: boolean; missingFields: string[] } => {
  const requiredFields = getRequiredFields(category);
  const missingFields: string[] = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || data[field] === '' || data[field] === null || data[field] === undefined) {
      missingFields.push(field);
    }
  });
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

export const getFieldLabel = (category: string, fieldKey: string): string => {
  const specs = getCategorySpecifications(category);
  const field = specs.find(spec => spec.key === fieldKey);
  return field ? field.label : fieldKey;
};