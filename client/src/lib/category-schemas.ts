export interface CategorySchema {
  filters: string[];
  specs: string[];
  displayName: string;
  description: string;
}

export const CATEGORY_SCHEMAS: Record<string, CategorySchema> = {
  tiles: {
    displayName: "Tiles",
    description: "Ceramic, porcelain, and natural stone tiles for floors and walls",
    filters: [
      "Size",
      "Finish", 
      "PEI Rating",
      "DCOF / Slip Resistance",
      "Water Absorption",
      "Edge Type",
      "Installation Method",
      "Surface Texture",
      "Color",
      "Country of Origin",
      "Material Type",
      "Suitable Applications"
    ],
    specs: [
      "peiRating",
      "slipRating", 
      "waterAbsorption",
      "finishType",
      "edgeType",
      "installationMethod",
      "surfaceTexture",
      "color",
      "countryOfOrigin",
      "materialType",
      "suitableApplications"
    ]
  },
  slabs: {
    displayName: "Stone & Slabs", 
    description: "Natural and engineered stone slabs for countertops and surfaces",
    filters: [
      "Material Type",
      "Slab Size", 
      "Thickness",
      "Finish",
      "Edge Options",
      "Surface Treatment",
      "Color/Pattern",
      "Application",
      "Price per Sq. Ft"
    ],
    specs: [
      "materialType",
      "slabSize",
      "thickness", 
      "finish",
      "edgeOptions",
      "surfaceTreatment",
      "colorPattern",
      "application",
      "pricePerSqFt"
    ]
  },
  lvt: {
    displayName: "Vinyl & LVT",
    description: "Luxury vinyl tile and plank flooring with advanced core construction",
    filters: [
      "Size",
      "Wear Layer",
      "Core Type",
      "Waterproof?",
      "Install Type",
      "Texture",
      "Finish Type",
      "Material Composition",
      "Commercial Grade?",
      "Country of Origin"
    ],
    specs: [
      "size",
      "wearLayer",
      "coreType",
      "waterproof",
      "installType",
      "texture",
      "finishType", 
      "materialComposition",
      "commercialGrade",
      "countryOfOrigin"
    ]
  },
  hardwood: {
    displayName: "Hardwood",
    description: "Solid and engineered hardwood flooring in various species and finishes",
    filters: [
      "Wood Species",
      "Solid/Engineered",
      "Finish Type", 
      "Texture",
      "Plank Size",
      "Thickness",
      "Install Method",
      "Color/Stain",
      "Country of Origin"
    ],
    specs: [
      "woodSpecies",
      "solidEngineered",
      "finishType", 
      "texture",
      "plankSize",
      "thickness",
      "installMethod",
      "colorStain",
      "countryOfOrigin"
    ]
  },
  heat: {
    displayName: "Heating Systems",
    description: "Electric radiant floor heating mats and cable systems",
    filters: [
      "Type",
      "Voltage",
      "Coverage Area (sq ft)",
      "Programmable Features",
      "Sensor Type",
      "Max Temperature",
      "Thermostat Included?",
      "Install Location"
    ],
    specs: [
      "type",
      "voltage",
      "coverageArea",
      "programmableFeatures",
      "sensorType",
      "maxTemperature",
      "thermostatIncluded",
      "installLocation"
    ]
  },
  thermostats: {
    displayName: "Thermostats",
    description: "Smart and programmable thermostats for radiant heating control",
    filters: [
      "Device Type", "Voltage", "Load Capacity", "Thermostat Sensor Type", 
      "Wi-Fi / Smart Features", "Programmable", "Display Type", 
      "Installation Type", "IP / NEMA Rating", "Color", "Warranty"
    ],
    specs: [
      "deviceType",
      "voltage",
      "loadCapacity",
      "sensorType",
      "smartFeatures",
      "programmable",
      "displayType",
      "installationType",
      "ipRating",
      "color",
      "warranty"
    ]
  },
  carpet: {
    displayName: "Carpet",
    description: "Broadloom and modular carpet tiles in various fibers and constructions",
    filters: [
      "Fiber Type",
      "Pile Height",
      "Stain Resistance",
      "Traffic Rating",
      "Carpet Style",
      "Backing",
      "Color",
      "Width",
      "Install Method",
      "IAQ Certification"
    ],
    specs: [
      "fiberType", 
      "pileHeight",
      "stainResistance",
      "trafficRating",
      "carpetStyle",
      "backing",
      "color",
      "width",
      "installMethod",
      "iaqCertification"
    ]
  }
};

export const getCategorySchema = (category: string): CategorySchema | null => {
  return CATEGORY_SCHEMAS[category] || null;
};

export const getAllCategories = (): string[] => {
  return Object.keys(CATEGORY_SCHEMAS);
};

export const getCategoryDisplayName = (category: string): string => {
  return CATEGORY_SCHEMAS[category]?.displayName || category;
};