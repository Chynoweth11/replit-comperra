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
      "Finish Type", 
      "PEI Rating",
      "Slip Resistance (DCOF)",
      "Water Absorption",
      "Edge Type",
      "Thickness",
      "Application",
      "Color Variation",
      "Frost Resistance"
    ],
    specs: [
      "peiRating",
      "slipRating", 
      "waterAbsorption",
      "finishType",
      "edgeType",
      "thickness",
      "frostResistant",
      "colorVariation",
      "breakingStrength",
      "thermalShock"
    ]
  },
  slabs: {
    displayName: "Stone & Slabs", 
    description: "Natural and engineered stone slabs for countertops and surfaces",
    filters: [
      "Material Type",
      "Thickness", 
      "Edge Options",
      "Finish",
      "Color Pattern",
      "Slab Size",
      "Hardness Rating",
      "Absorption Rate",
      "Heat Resistance",
      "Stain Resistance"
    ],
    specs: [
      "materialType",
      "thickness",
      "edgeOptions", 
      "finishType",
      "colorPattern",
      "slabSize",
      "hardnessRating",
      "absorptionRate",
      "heatResistance",
      "stainResistance"
    ]
  },
  lvt: {
    displayName: "Vinyl & LVT",
    description: "Luxury vinyl tile and plank flooring with advanced core construction",
    filters: [
      "Plank/Tile Size",
      "Wear Layer Thickness",
      "Core Type",
      "Waterproof Rating",
      "Install Method",
      "Texture",
      "Acoustic Rating",
      "Total Thickness",
      "Warranty Period",
      "Commercial Rating"
    ],
    specs: [
      "wearLayer",
      "coreType",
      "waterproof",
      "installMethod",
      "texture",
      "acousticRating", 
      "totalThickness",
      "warranty",
      "commercialRating",
      "indentationResistance"
    ]
  },
  hardwood: {
    displayName: "Hardwood",
    description: "Solid and engineered hardwood flooring in various species and finishes",
    filters: [
      "Wood Species",
      "Board Width",
      "Board Length", 
      "Finish Type",
      "Janka Hardness",
      "Grade",
      "Installation Type",
      "Thickness",
      "Construction",
      "Moisture Content"
    ],
    specs: [
      "species",
      "boardWidth",
      "boardLength",
      "finishType", 
      "jankaHardness",
      "grade",
      "installationType",
      "thickness",
      "construction",
      "moistureContent"
    ]
  },
  heat: {
    displayName: "Heating Systems",
    description: "Electric radiant floor heating mats and cable systems",
    filters: [
      "System Type",
      "Voltage",
      "Coverage Area (sq ft)",
      "Power Output (W/sq ft)",
      "Sensor Type",
      "Max Temperature",
      "Cable Spacing", 
      "Installation Depth",
      "Warranty Period",
      "Smart Controls"
    ],
    specs: [
      "systemType",
      "voltage",
      "coverageArea",
      "powerOutput",
      "sensorType",
      "maxTemperature",
      "cableSpacing",
      "installationDepth", 
      "warranty",
      "smartControls"
    ]
  },
  carpet: {
    displayName: "Carpet",
    description: "Broadloom and modular carpet tiles in various fibers and constructions",
    filters: [
      "Fiber Type",
      "Pile Height",
      "Pile Density",
      "Construction Method",
      "Backing Type",
      "Stain Resistance",
      "Fade Resistance",
      "Width Options",
      "Traffic Rating",
      "Antistatic Treatment"
    ],
    specs: [
      "fiberType", 
      "pileHeight",
      "pileDensity",
      "constructionMethod",
      "backingType",
      "stainResistance",
      "fadeResistance",
      "widthOptions",
      "trafficRating",
      "antistaticTreatment"
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