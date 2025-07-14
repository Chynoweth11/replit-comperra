// ===================================================================
// COMPERRA SCRAPING SYSTEM - ENHANCED TYPES
// ===================================================================

export interface BaseSpecifications {
    productName: string;
    brandManufacturer: string;
    category: string;
    productUrl: string;
    imageUrl: string;
    materialType?: string;
    pricePerSf?: string;
    color?: string;
    finish?: string;
    // Feature Flags
    isOutdoor?: boolean;
    frostResistant?: boolean;
    chemicalResistant?: boolean;
}

export interface TileSpecifications extends BaseSpecifications {
    dimensions: string;
    materialType: 'Porcelain' | 'Ceramic' | 'Natural Stone Tile' | 'Glass' | 'Metal';
    peiRating?: string;
    dcofRating?: string;
}

export interface SlabSpecifications extends BaseSpecifications {
    slabDimensions: string;
    materialType: 'Porcelain Slab' | 'Engineered Quartz' | 'Natural Quartzite' | 'Natural Granite' | 'Natural Marble';
    thickness?: string;
}

export interface HeatingSpecifications extends BaseSpecifications {
    application: 'Indoor' | 'Outdoor' | 'Exterior' | 'Indoor/Outdoor';
    voltage?: string;
    wattage?: string;
}

export interface ThermostatSpecifications extends BaseSpecifications {
    deviceType: 'Programmable' | 'Smart' | 'Manual';
    hasWifi: boolean;
    supportsAlexa: boolean;
    supportsGoogleAssistant: boolean;
}

export interface LVTSpecifications extends BaseSpecifications {
    materialType: 'Luxury Vinyl Tile' | 'Luxury Vinyl Plank' | 'Waterproof LVT';
    wearLayer?: string;
    thickness?: string;
    waterproof?: boolean;
}

export interface HardwoodSpecifications extends BaseSpecifications {
    materialType: 'Engineered Hardwood' | 'Solid Hardwood' | 'Reclaimed Wood';
    species?: string;
    grade?: string;
    jankaHardness?: string;
}

export interface CarpetSpecifications extends BaseSpecifications {
    materialType: 'Carpet Tile' | 'Broadloom' | 'Area Rug';
    fiber?: string;
    pileHeight?: string;
    stainResistance?: string;
}

// Enhanced category types
export type MaterialCategory = 'tiles' | 'slabs' | 'lvt' | 'hardwood' | 'carpet' | 'heat' | 'thermostats' | 'mosaics' | 'backsplash' | 'trim';

export type MaterialSpecifications = 
    | TileSpecifications 
    | SlabSpecifications 
    | HeatingSpecifications 
    | ThermostatSpecifications 
    | LVTSpecifications 
    | HardwoodSpecifications 
    | CarpetSpecifications 
    | BaseSpecifications;