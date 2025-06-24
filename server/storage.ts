import { 
  materials, 
  articles, 
  brands,
  type Material, 
  type InsertMaterial,
  type Article,
  type InsertArticle,
  type Brand,
  type InsertBrand
} from "@shared/schema";

export interface IStorage {
  // Materials
  getMaterials(filters?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Material[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  
  // Articles
  getArticles(): Promise<Article[]>;
  getArticle(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  
  // Brands
  getBrands(): Promise<Brand[]>;
  getBrand(id: number): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
}

export class MemStorage implements IStorage {
  private materials: Map<number, Material>;
  private articles: Map<number, Article>;
  private brands: Map<number, Brand>;
  private currentMaterialId: number;
  private currentArticleId: number;
  private currentBrandId: number;

  constructor() {
    this.materials = new Map();
    this.articles = new Map();
    this.brands = new Map();
    this.currentMaterialId = 1;
    this.currentArticleId = 1;
    this.currentBrandId = 1;
    this.seedData();
  }

  private seedData() {
    // Seed brands
    const brandsData = [
      { name: "Daltile", description: "Leading tile manufacturer", website: "https://daltile.com" },
      { name: "Mohawk", description: "Flooring industry leader", website: "https://mohawk.com" },
      { name: "Shaw", description: "Premium flooring solutions", website: "https://shaw.com" },
      { name: "Marazzi", description: "Italian tile excellence", website: "https://marazzi.com" },
      { name: "Cambria", description: "American quartz surfaces", website: "https://cambriausa.com" },
      { name: "Bruce", description: "Hardwood flooring specialists", website: "https://bruce.com" },
      { name: "Warmly Yours", description: "Radiant heating systems", website: "https://warmlyyours.com" },
    ];

    brandsData.forEach(brand => {
      const newBrand: Brand = { 
        id: this.currentBrandId++,
        name: brand.name,
        description: brand.description || null,
        website: brand.website || null,
        logoUrl: null
      };
      this.brands.set(newBrand.id, newBrand);
    });

    // Seed materials
    const materialsData: InsertMaterial[] = [
      {
        name: "Metropolis Gray",
        category: "tiles",
        brand: "Daltile",
        price: "4.99",
        imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Large Format Porcelain Tile",
        specifications: {
          'PEI Rating': '4',
          'DCOF / Slip Rating': '0.42',
          'Water Absorption': '< 0.5%',
          'Finish': 'Matte',
          'Material Type': 'Porcelain',
          'Dimensions': '24x48'
        },
        dimensions: "24\"x48\"",
        inStock: true,
      },
      {
        name: "Classic Subway",
        category: "tiles",
        brand: "Mohawk",
        price: "2.49",
        imageUrl: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Ceramic Wall Tile",
        specifications: {
          'PEI Rating': '2',
          'DCOF / Slip Rating': '0.38',
          'Water Absorption': '3-7%',
          'Finish': 'Glossy',
          'Material Type': 'Ceramic',
          'Dimensions': '3x6'
        },
        dimensions: "3\"x6\"",
        inStock: true,
      },
      {
        name: "Carrara Marble Look",
        category: "tiles",
        brand: "Marazzi",
        price: "6.89",
        imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Porcelain Floor Tile",
        specifications: {
          'PEI Rating': '5',
          'DCOF / Slip Rating': '0.52',
          'Water Absorption': '< 0.5%',
          'Finish': 'Polished',
          'Material Type': 'Porcelain',
          'Dimensions': '12x24'
        },
        dimensions: "12\"x24\"",
        inStock: true,
      },
      {
        name: "Brittanicca",
        category: "slabs",
        brand: "Cambria",
        price: "89.99",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Cambria Quartz Countertop",
        specifications: {
          'Product Name': 'Brittanicca',
          'Brand / Manufacturer': 'Cambria',
          'Category': 'Slab',
          'Material Type': 'Quartz',
          'Color / Pattern': 'White with Gray Veining',
          'Finish': 'Polished',
          'Thickness': '3cm',
          'Slab Dimensions': '126" x 63"',
          'Edge Type': 'Straight, Beveled, Bullnose, Ogee, Waterfall',
          'Applications': 'Countertops, Backsplashes, Vanities',
          'Water Absorption': 'Non-Porous',
          'Scratch / Etch Resistance': 'Excellent',
          'Heat Resistance': 'Up to 400°F',
          'Country of Origin': 'USA',
          'Price per SF': '$89.99',
          'Image URL': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
          'Product URL': 'https://www.cambriausa.com/designs/brittanicca'
        },
        dimensions: "126\"x63\"",
        inStock: true,
      },
      {
        name: "Coastline Oak",
        category: "lvt",
        brand: "Shaw",
        price: "3.89",
        imageUrl: "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Waterproof LVP",
        specifications: {
          'Product Name': 'Coastline Oak Luxury Vinyl Plank',
          'Brand/Manufacturer': 'Shaw',
          'Material Type': 'Luxury Vinyl Plank (LVP)',
          'Wear Layer': '20 mil',
          'Core Type': 'SPC (Stone Plastic Composite)',
          'Thickness': '5.5mm',
          'Width': '7"',
          'Length': '48"',
          'Waterproof': 'Yes - 100% waterproof',
          'Installation Method': 'Floating, Click-Lock',
          'Texture/Surface': 'Embossed Wood Grain',
          'Finish': 'Low-Gloss Urethane',
          'Edge Type': 'Painted Bevel',
          'Underlayment': 'Attached Cork Backing',
          'Sound Rating': 'IIC 51, STC 52',
          'Indentation Rating': '0.05mm (Class 33)',
          'Commercial Rating': 'Light Commercial',
          'Residential Warranty': '20-year wear warranty',
          'Commercial Warranty': '5-year light commercial',
          'Installation Warranty': '1-year',
          'Slip Resistance': 'R10 wet barefoot',
          'Country of Origin': 'USA',
          'Environmental': 'FloorScore Certified, Low VOC',
          'Product URL': 'https://www.shawfloors.com/flooring/luxury-vinyl/coastline-oak'
        },
        dimensions: "7\"x48\"",
        inStock: true,
      },
      {
        name: "Red Oak Solid",
        category: "hardwood",
        brand: "Bruce",
        price: "6.99",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "3/4\" Solid Hardwood",
        specifications: {
          'Product Name': 'Red Oak Solid Hardwood',
          'Brand/Manufacturer': 'Bruce',
          'Species': 'Red Oak (Quercus rubra)',
          'Grade': 'Select & Better',
          'Construction Type': 'Solid Wood',
          'Finish': 'Pre-Finished Polyurethane',
          'Width': '3.25"',
          'Thickness': '3/4"',
          'Length': 'Random Length 12" - 84"',
          'Material Type': 'Solid Hardwood',
          'Edge Profile': 'Micro-Beveled',
          'Installation Method': 'Nail Down, Glue Down',
          'Janka Hardness': '1,290 lbf',
          'Moisture Content': '6-8%',
          'Gloss Level': 'Semi-Gloss (30-35 sheen)',
          'Warranty': '25-year residential finish warranty',
          'Country of Origin': 'USA',
          'CARB Compliance': 'CARB2 Compliant',
          'Applications': 'Residential, Light Commercial',
          'Product URL': 'https://www.bruce.com/hardwood-flooring/red-oak-solid'
        },
        dimensions: "3/4\"x3.25\"",
        inStock: true,
      },
      {
        name: "TempZone Floor Heating",
        category: "heat",
        brand: "Warmly Yours",
        price: "8.99",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Electric Radiant Mat",
        specifications: {
          'Voltage': '120V',
          'Coverage': '30 sq ft',
          'Features': 'WiFi Ready, Programmable, Energy Efficient',
          'Power': '240W',
          'Type': 'Electric Radiant Mat',
          'Applications': 'Tile, Stone, Laminate',
          'Warranty': '10 Years',
          'Installation': 'Professional Recommended',
          'Dimensions': '30 sq ft'
        },
        dimensions: "30 sq ft",
        inStock: true,
      },
      {
        name: "Stainmaster PetProtect",
        category: "carpet",
        brand: "Mohawk",
        price: "4.29",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Pet-Friendly Carpet",
        specifications: {
          fiberType: "Nylon",
          stainResistance: "Excellent",
          pileHeight: "0.5\"",
          width: "12' Width",
          trafficRating: "Heavy Traffic"
        },
        dimensions: "12' Width",
        inStock: true,
      },
      {
        name: "6iE Smart WiFi Thermostat",
        category: "thermostats",
        brand: "Warmup",
        price: "249.99",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Advanced smart thermostat with WiFi connectivity and energy monitoring",
        specifications: {
          'Product Name': '6iE Smart WiFi Thermostat',
          'Brand/Manufacturer': 'Warmup',
          'Category': 'Thermostat (Indoor Heating)',
          'Device Type': 'Smart Wi-Fi Thermostat',
          'Voltage': '120V/240V',
          'Load Capacity': '15A / 3,600W',
          'Sensor Type': 'Floor Sensor + Ambient Sensor',
          'Sensor Cable Length': '10 ft / 3m (extendable)',
          'GFCI Protection': 'Built-in GFCI, Class A 5mA',
          'Display Type': 'Color Touchscreen',
          'Connectivity': 'Wi-Fi, App-controlled, Alexa/Google support',
          'Programmable': 'Yes - 7-day schedule',
          'Geo-Learning/AI': 'SmartGeo, auto-schedule based on presence',
          'Installation Type': 'Wall mount, recessed compatible',
          'IP Rating': 'IP33 (indoor use)',
          'Color/Finish': 'Gloss White',
          'Warranty': '3-year manufacturer warranty',
          'Certifications': 'UL, ETL, CSA, CE, FCC, RoHS',
          'Compatible Heating': 'Electric underfloor heating, radiant cables',
          'User Interface Features': 'Touchscreen, remote override, app alerts, QR setup',
          'Manual Override': 'Yes (emergency override available)',
          'Product URL': 'https://www.warmup.com/thermostats/6ie-smart-wifi-thermostat'
        },
        dimensions: "3.5\"x5.5\"",
        inStock: true,
      },
      // Additional Tiles
      {
        name: "Travertine Natural",
        category: "tiles",
        brand: "Marazzi",
        price: "8.99",
        imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Natural Stone Floor Tile",
        specifications: {
          'PEI Rating': '3',
          'DCOF / Slip Rating': '0.48',
          'Water Absorption': '2-6%',
          'Finish': 'Honed',
          'Material Type': 'Natural Stone',
          'Dimensions': '18x18'
        },
        dimensions: "18\"x18\"",
        inStock: true,
      },
      {
        name: "Metro White Subway",
        category: "tiles",
        brand: "Daltile",
        price: "1.89",
        imageUrl: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Classic Ceramic Wall Tile",
        specifications: {
          'PEI Rating': '1',
          'DCOF / Slip Rating': '0.35',
          'Water Absorption': '7-10%',
          'Finish': 'Glossy',
          'Material Type': 'Ceramic',
          'Dimensions': '3x6'
        },
        dimensions: "3\"x6\"",
        inStock: true,
      },
      // Additional Slabs
      {
        name: "Calacatta Gold",
        category: "slabs",
        brand: "Cambria",
        price: "95.99",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Premium Quartz Countertop",
        specifications: {
          'Product Name': 'Calacatta Gold',
          'Brand / Manufacturer': 'Cambria',
          'Category': 'Slab',
          'Material Type': 'Quartz',
          'Color / Pattern': 'White with Gold Veining',
          'Finish': 'Polished',
          'Thickness': '3cm',
          'Slab Dimensions': '126" x 63"',
          'Edge Type': 'Straight, Beveled, Bullnose, Ogee',
          'Applications': 'Countertops, Backsplashes, Vanities',
          'Water Absorption': 'Non-Porous',
          'Scratch / Etch Resistance': 'Excellent',
          'Heat Resistance': 'Up to 400°F',
          'Country of Origin': 'USA',
          'Price per SF': '$95.99',
          'Image URL': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
          'Product URL': 'https://www.cambriausa.com/designs/calacatta-gold'
        },
        dimensions: "126\"x63\"",
        inStock: true,
      },
      {
        name: "Carrara Marble",
        category: "slabs",
        brand: "MSI",
        price: "65.99",
        imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Natural Marble Slab",
        specifications: {
          'Product Name': 'Carrara Marble',
          'Brand / Manufacturer': 'MSI',
          'Category': 'Stone',
          'Material Type': 'Marble',
          'Color / Pattern': 'White with Gray Veining',
          'Finish': 'Polished',
          'Thickness': '2cm',
          'Slab Dimensions': '118" x 55"',
          'Edge Type': 'Straight, Beveled, Bullnose',
          'Applications': 'Countertops, Vanities',
          'Water Absorption': '< 0.5%',
          'Scratch / Etch Resistance': 'Moderate',
          'Heat Resistance': 'Moderate',
          'Country of Origin': 'Italy',
          'Price per SF': '$65.99',
          'Image URL': 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
          'Product URL': 'https://www.msisurfaces.com/carrara-marble'
        },
        dimensions: "118\"x55\"",
        inStock: true,
      },
      // Additional LVT
      {
        name: "Heritage Oak",
        category: "lvt",
        brand: "Mohawk",
        price: "4.49",
        imageUrl: "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Luxury Vinyl Plank",
        specifications: {
          'Product Name': 'Heritage Oak Luxury Vinyl Plank',
          'Brand/Manufacturer': 'Mohawk',
          'Material Type': 'Luxury Vinyl Plank (LVP)',
          'Wear Layer': '22 mil Enhanced',
          'Core Type': 'WPC (Wood Plastic Composite)',
          'Thickness': '6.5mm',
          'Width': '7"',
          'Length': '48"',
          'Waterproof': 'Yes - 100% waterproof',
          'Installation Method': 'Floating, Click-Lock, Glue-Down',
          'Texture/Surface': 'Hand-Scraped Wood Grain',
          'Finish': 'Aluminum Oxide Enhanced',
          'Edge Type': 'Micro-Beveled',
          'Underlayment': 'Integrated IXPE Foam',
          'Sound Rating': 'IIC 56, STC 60',
          'Indentation Rating': '0.03mm (Class 33/42)',
          'Commercial Rating': 'Heavy Commercial',
          'Residential Warranty': '25-year wear warranty',
          'Commercial Warranty': '10-year heavy commercial',
          'Installation Warranty': '2-year',
          'Slip Resistance': 'R11 wet barefoot',
          'Country of Origin': 'USA',
          'Environmental': 'GreenGuard Gold, FloorScore',
          'Product URL': 'https://www.mohawkflooring.com/luxury-vinyl/heritage-oak'
        },
        dimensions: "7\"x48\"",
        inStock: true,
      },
      {
        name: "Stone Creek Slate",
        category: "lvt",
        brand: "COREtec",
        price: "5.99",
        imageUrl: "https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Waterproof Luxury Vinyl Tile",
        specifications: {
          'Product Name': 'Stone Creek Slate Luxury Vinyl Tile',
          'Brand/Manufacturer': 'COREtec',
          'Material Type': 'Luxury Vinyl Tile (LVT)',
          'Wear Layer': '40 mil Commercial Grade',
          'Core Type': 'WPC Plus (Wood Plastic Composite)',
          'Thickness': '8mm',
          'Width': '12"',
          'Length': '24"',
          'Waterproof': 'Yes - 100% waterproof',
          'Installation Method': 'Floating, Click-Lock, Glue-Down',
          'Texture/Surface': 'Natural Stone Texture',
          'Finish': 'Matte Protective Coating',
          'Edge Type': 'Straight Edge',
          'Underlayment': 'Attached Cork + Foam',
          'Sound Rating': 'IIC 67, STC 64',
          'Indentation Rating': '0.02mm (Class 33/42/43)',
          'Commercial Rating': 'Heavy Commercial + Light Industrial',
          'Residential Warranty': 'Lifetime residential warranty',
          'Commercial Warranty': '15-year heavy commercial',
          'Installation Warranty': '5-year',
          'Slip Resistance': 'R12 wet/dry',
          'Country of Origin': 'USA',
          'Environmental': 'GreenGuard Gold, Cradle to Cradle',
          'Product URL': 'https://www.coretecfloors.com/luxury-vinyl/stone-creek-slate'
        },
        dimensions: "12\"x24\"",
        inStock: true,
      },
      // Additional Hardwood
      {
        name: "Maple Select",
        category: "hardwood",
        brand: "Bruce",
        price: "8.99",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "3/4\" Solid Maple",
        specifications: {
          species: "Hard Maple",
          finishType: "Pre-Finished",
          plankWidth: "2.25\"",
          thickness: "3/4\"",
          construction: "Solid"
        },
        dimensions: "3/4\"x2.25\"",
        inStock: true,
      },
      {
        name: "Hickory Engineered",
        category: "hardwood",
        brand: "Shaw",
        price: "7.49",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "5\" Engineered Hickory",
        specifications: {
          species: "Hickory",
          finishType: "Pre-Finished",
          plankWidth: "5\"",
          thickness: "1/2\"",
          construction: "Engineered"
        },
        dimensions: "1/2\"x5\"",
        inStock: true,
      },
      // Additional Heating
      {
        name: "SunTouch Floor Warming",
        category: "heat",
        brand: "Warmly Yours",
        price: "12.99",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "240V Electric Radiant Mat",
        specifications: {
          'Voltage': '240V',
          'Coverage': '50 sq ft',
          'Features': 'WiFi Ready, Programmable, GFCI Protected',
          'Power': '500W',
          'Type': 'Electric Radiant Mat',
          'Applications': 'Tile, Stone, Engineered Wood',
          'Warranty': '15 Years',
          'Installation': 'Professional Recommended',
          'Dimensions': '50 sq ft'
        },
        dimensions: "50 sq ft",
        inStock: true,
      },
      // Additional Carpet
      {
        name: "Berber Twist",
        category: "carpet",
        brand: "Shaw",
        price: "3.89",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Loop Pile Carpet",
        specifications: {
          fiberType: "Polyester",
          stainResistance: "Good",
          pileHeight: "0.25\"",
          width: "12' Width",
          trafficRating: "Medium Traffic"
        },
        dimensions: "12' Width",
        inStock: true,
      },
    ];

    materialsData.forEach(material => {
      const newMaterial: Material = { 
        ...material, 
        id: this.currentMaterialId++,
        imageUrl: material.imageUrl || null,
        description: material.description || null,
        dimensions: material.dimensions || null,
        inStock: material.inStock || null
      };
      this.materials.set(newMaterial.id, newMaterial);
    });

    // Seed articles
    const articlesData: InsertArticle[] = [
      {
        title: "Best Porcelain Tiles of 2025",
        description: "Porcelain tiles have long been a staple in both residential and commercial design due to their low water absorption, high compressive strength, and visual flexibility. In 2025, manufacturers have pushed even further, offering advanced textures, sustainable production methods, and more precise rectified edges for tighter grout lines. This guide details our in-depth testing of over 60 tiles across top U.S. and European brands.",
        content: `Porcelain tile is produced from denser clay and fired at higher temperatures than ceramic, making it ideal for wet environments like bathrooms and kitchens. When selecting a porcelain tile, it's critical to consider PEI ratings (indicating resistance to surface wear), slip resistance (measured via DCOF), and aesthetic elements like finish and edge profile. While matte finishes are trending in residential use, polished and structured textures are still dominating the commercial market.

We also compared average installation costs based on layout complexity (straight lay vs herringbone or large format), and evaluated ease of cutting and chipping during install.

Key Factors Compared:
• Slip Resistance (DCOF): Threshold for commercial-grade safety (≥ 0.42)
• Durability (PEI Rating): Surface wear resistance, with PEI 4 and 5 being most durable
• Water Absorption: Vitreous (< 0.5%) for optimal performance in wet areas
• Installation Costs: Average $4–$12 per sq. ft. depending on layout complexity
• Design Trends: Matte concrete-look, large format (24x48), and 3D textured surfaces

Top Picks:
• Best overall: Daltile Emerson Wood Matte 6x36
• Best for showers: Marazzi Classentino Marble Polished 12x24
• Best budget pick: Arizona Tile Aequa Series 8x32`,
        imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Buyer's Guide",
        readTime: 8,
        publishedAt: "Jan 15, 2025",
        slug: "best-porcelain-tiles-2025",
      },
      {
        title: "Top Quartz Slabs Compared",
        description: "Quartz countertops continue to dominate residential and commercial design for their consistent patterns, nonporous properties, and low maintenance needs. Engineered using natural quartz crystals and resin binders, these surfaces offer the beauty of stone with improved functionality. In this guide, we meticulously examined 30+ slabs across Cambria, Caesarstone, MSI, and Silestone—the industry's biggest players.",
        content: `Each brand offers unique advantages: Cambria is known for luxurious, marble-like aesthetics and is entirely made in the U.S.; Caesarstone leads in subtle modern patterns and superior stain resistance; MSI provides affordability and availability; while Silestone champions sustainability and antibacterial technology. Our evaluation covered pricing, installation costs, finish type (polished, suede, volcano), thickness options (2cm vs 3cm), and resistance to heat, abrasion, and impact.

We also looked at color consistency, warranty coverage, and how well each slab matched with edge profiles for waterfall islands and integrated backsplashes. Sustainability was another major factor—Silestone's HybriQ technology uses 99% reused water and 20% recycled materials. Cambria also maintains Greenguard Gold certification for indoor air quality.

Comparison Points:
• Cambria: American-made, natural stone aesthetics, lifetime warranty
• Caesarstone: Minimalist colors, industry leader in stain resistance
• MSI Q Quartz: Budget-friendly with wide availability and pattern consistency
• Silestone: Pioneers in antimicrobial protection and recycled content
• Thickness: 2cm vs 3cm slabs for varying applications
• Finish: Polished, Suede, Volcano
• Price Range: $45–$110/sq. ft. installed
• Sustainability: LEED points eligibility and recycled content

Top Picks:
• Best pattern: Cambria Brittanicca Warm
• Most stain-resistant: Caesarstone Pure White`,
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Comparison",
        readTime: 12,
        publishedAt: "Jan 12, 2025",
        slug: "top-quartz-slabs-compared",
      },
      {
        title: "Best Carpets for High-Traffic Areas",
        description: "Carpet in high-traffic zones must do more than look good—it must perform. In commercial buildings, multi-family units, and active households, carpet endures rolling traffic, foot traffic, spills, and repetitive impact. For this guide, we analyzed dozens of products from major brands like Shaw, Mohawk, and Interface, focusing on fiber composition, surface structure, stain resistance, and long-term maintenance.",
        content: `Nylon 6 and Nylon 6.6 fibers are the most durable for high-wear zones due to their elasticity and abrasion resistance. Triexta (used in Mohawk's SmartStrand) delivers superior softness with excellent stain resistance and a lower environmental impact. Polyester, while cost-effective, shows more wear under heavy foot traffic. We tested modular tiles vs broadloom for ease of replacement and found tile systems offer lower lifecycle costs despite higher upfront pricing.

Stain guard treatments, pile height, density, and backing technology all play a role in longevity. Interface's modular carpet lines featured superior durability while offering sustainable PVC-free options. Shaw's commercial carpets ranked highest for crush resistance and wear performance.

Test Criteria:
• Taber Abrasion Testing: Measures fiber wear rate under continuous friction
• Stain Resistance: Tested with common household and commercial spills
• Crush Recovery: Assesses pile recovery after compression
• Installation Costs: $3–$8 per sq. ft.
• Fiber Types: Nylon 6, Nylon 6.6, Triexta, Polyester

Top Picks:
• Modular durability: Shaw Contract Color Form Carpet Tile
• Best stain resistance: Mohawk SmartStrand Silk
• Eco-friendly option: Interface Human Nature Series`,
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Performance",
        readTime: 6,
        publishedAt: "Jan 10, 2025",
        slug: "best-carpets-high-traffic",
      },
      {
        title: "Best Heat Mats & Radiant Floor Systems (2025)",
        description: "Radiant heating systems offer unmatched comfort and energy efficiency, especially in tile-heavy spaces like kitchens and bathrooms. In this guide, we analyzed heating mats and cables from brands such as WarmlyYours, Schluter DITRA-HEAT, and SunTouch. These systems were tested in both residential renovations and new-builds across tile, engineered wood, and vinyl applications.",
        content: `We compared coverage uniformity, thermostat technology, heating speed, and installation compatibility. 240V systems are best suited for larger areas, while 120V systems are ideal for small bathrooms or powder rooms. Floor sensors improve energy efficiency and comfort by ensuring the system responds to actual surface temperatures. Modern thermostats now feature Wi-Fi scheduling, touchscreens, and smart home integrations with Alexa or Google Assistant.

DITRA-HEAT stood out for integrating heat cables with an uncoupling membrane, reducing cracking and tile stress. WarmlyYours provided the most comprehensive support and warranty terms, while SunTouch offered best-in-class installation speed for contractors.

Key Comparisons:
• Voltage: 120V (small rooms) vs 240V (large spaces)
• Sensor Type: Floor-only, ambient, or dual sensor
• Control Features: Wi-Fi enabled, programmable, smart home integration
• Install Compatibility: Under tile, vinyl, engineered wood
• Temperature Range: Max 82°F–104°F for safe radiant performance

Top Picks:
• Best smart system: WarmlyYours TempZone with nSpire Touch Wi-Fi
• Most durable cable: SunTouch TapeMat 240V 30 sq. ft.
• Best integrated system: Schluter DITRA-HEAT with DHERT104 thermostat`,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Heating Guide",
        readTime: 7,
        publishedAt: "Jan 8, 2025",
        slug: "best-heat-mats-radiant-floor-systems-2025",
      },
      {
        title: "Top Luxury Vinyl & LVT Flooring Picks",
        description: "Luxury Vinyl Tile (LVT) and plank (LVP) flooring are widely embraced for their waterproof features, affordability, and realistic textures that mimic hardwood and stone. In 2025, technology has further improved wear layer coatings, acoustic underlayment, and visual realism through Embossed-in-Register (EIR) texturing.",
        content: `This guide covers top-performing LVT options from COREtec, Shaw, Karndean, and Mohawk. Each product was assessed for dimensional stability, dent resistance, sound rating (IIC), wear layer thickness, and DIY-friendliness. SPC (Stone Plastic Composite) cores are preferred in high-traffic or temperature-variable spaces, while WPC (Wood Plastic Composite) offers more cushioning underfoot.

LVT's click-lock and glue-down systems were reviewed for ease of installation and long-term hold. Core types were tested for resistance to heat, moisture, and subfloor imperfections. Many top-tier products now include pre-attached acoustic pads and antimicrobial finishes.

Evaluation Criteria:
• Wear Layer Thickness: 12 mil to 30 mil (residential to commercial grade)
• Core Type: SPC for durability, WPC for comfort
• Acoustic Ratings: IIC ≥ 60 for quiet environments
• Visuals: EIR texture and high-definition printing
• Installation Systems: Click-lock, Drop-lock, Glue-down

Top Picks:
• Most durable SPC: COREtec Pro Plus HD 7x48
• Best wide-plank look: Karndean Korlok Select
• Great tile-look option: Shaw Paragon Tile Plus`,
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Durability & Design",
        readTime: 9,
        publishedAt: "Jan 6, 2025",
        slug: "top-luxury-vinyl-lvt-flooring-picks",
      },
      {
        title: "Best Hardwood Flooring for Modern Homes",
        description: "Hardwood floors are prized for their natural beauty, resale value, and longevity. This guide dives into both solid and engineered wood flooring suitable for modern homes. From wide-plank European oak to eco-certified maple, we examined 40+ flooring products for stability, hardness, finish, and environmental performance.",
        content: `Solid hardwood offers unmatched authenticity but is prone to expansion/contraction, making engineered formats more stable in dry or humid climates. We compared finishes such as oil-rubbed, UV-cured urethane, and wire-brushed textures. Species like hickory and white oak ranked highest in Janka hardness and dent resistance.

Installation methods—including floating, glue-down, and nail-down—were reviewed for durability and flexibility. Engineered cores (multi-ply, HDF, and hybrid) were tested for subfloor compatibility. Sustainability scores included FSC certification and formaldehyde-free adhesives.

Comparison Metrics:
• Species Hardness: Oak, Maple, Hickory, Walnut (Janka scale)
• Finish Type: UV-cured, oil-rubbed, wire-brushed
• Board Dimensions: 5–9" wide-plank, beveled edges
• Installation Methods: Glue-down, floating, nail-down
• Sustainability: FSC certified, low-VOC materials

Top Picks:
• Best overall: Lauzon Organik Series Maple 7.5"
• Best engineered: Mirage Red Oak Engineered 5"
• Premium design: DuChâteau Atelier Line European Oak`,
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Design & Longevity",
        readTime: 10,
        publishedAt: "Jan 4, 2025",
        slug: "best-hardwood-flooring-modern-homes",
      },
      {
        title: "Best Thermostats for Radiant Floor and Outdoor Heating",
        description: "Complete guide to programmable and smart thermostats for in-floor heating and snow-melt systems.",
        content: `# Best Thermostats for Radiant Floor and Outdoor Heating

Thermostats used in radiant floor heating and snow-melt systems do far more than regulate temperature — they serve as the control center for comfort, safety, and energy efficiency. Whether installed in bathrooms, kitchens, basements, or even outdoor driveways and walkways, the thermostat must be properly matched to the system to ensure optimal performance.

This guide focuses on programmable and smart thermostats designed for in-floor heating systems (tile, stone, LVT, hardwood) and exterior snow melting applications. We evaluated key features such as voltage compatibility, sensor type, programming flexibility, protection ratings, and installation requirements.

For interior floor heating, thermostats should offer floor and air sensors, GFCI protection, and user-friendly scheduling. For outdoor systems, thermostats or controllers must handle higher loads and detect both temperature and moisture to operate snow-melt systems only when necessary, minimizing energy waste.

## Evaluation Criteria

**Voltage Compatibility:** Supports 120V, 208V, or 240V depending on the heating system size

**Load Capacity:** Typically ranges from 15 amps (interior) to 30+ amps (outdoor)

**Sensor Types:** Floor sensor, air sensor, or moisture detection (for outdoor)

**Programmability:** 7-day schedules, vacation modes, and override functions

**Display Interface:** Digital or touchscreen interfaces with temperature readout

**Smart Features:** Optional Wi-Fi, mobile app control, geo-learning, or remote access

**Safety & Protection:** Built-in GFCI or GFEP required by code for interior use

**Weather Protection:** Outdoor-rated enclosures (e.g., IP65 or NEMA 3R) for driveway controllers

**Installation Type:** Wall-mounted (interior) or surface-mounted (exterior enclosures)

**Energy Optimization:** Adaptive start, learning behavior, or weather-based automation

**Warranty:** Commonly ranges from 3 to 12 years depending on application and manufacturer

## Recommended Use Scenarios

**Bathrooms & Kitchens**
Use dual-sensor thermostats (air + floor) with programmable schedules to maintain comfort and reduce energy waste.

**Basements & Living Areas**
Prioritize models with learning algorithms, multi-zone control, or smart device compatibility for whole-home integration.

**Outdoor Driveways & Walkways**
Use moisture + temperature sensing units with weatherproof enclosures. These detect snow/ice and trigger heating only when needed, reducing runtime and electrical load.

**Multi-Zone Systems**
Use thermostats with relay support or zone controllers when managing multiple rooms or large slab areas.

## What to Avoid

**Basic HVAC Thermostats**
These often lack floor sensors and can't control heating mats or cables. Always use thermostats rated for radiant floor heating.

**No-GFCI Models for Interior Use**
For safety and code compliance, only use thermostats with built-in GFCI or ensure the circuit is protected by an external GFEP.

**Non-rated Enclosures for Outdoor Use**
For snow-melt systems, always choose thermostats/controllers with appropriate weatherproof ratings (IP65 or NEMA 3R minimum).

## Final Thoughts

Choosing the right thermostat ensures your heating system performs safely, efficiently, and comfortably over the long term. Whether you're heating a bathroom floor or keeping a driveway ice-free in winter, focus on specs like voltage, sensor types, load capacity, and protection level. A properly matched thermostat not only improves energy use but also extends the life of your system.`,
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "thermostats",
        readTime: 12,
        publishedAt: "Jan 8, 2025",
        slug: "best-thermostats-radiant-floor-outdoor-heating",
      },
    ];

    articlesData.forEach(article => {
      const newArticle: Article = { 
        ...article, 
        id: this.currentArticleId++,
        imageUrl: article.imageUrl || null,
        content: article.content ?? null
      };
      this.articles.set(newArticle.id, newArticle);
    });
  }

  async getMaterials(filters?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Material[]> {
    let filteredMaterials = Array.from(this.materials.values());

    if (filters) {
      if (filters.category) {
        filteredMaterials = filteredMaterials.filter(m => m.category === filters.category);
      }
      if (filters.brand) {
        filteredMaterials = filteredMaterials.filter(m => m.brand === filters.brand);
      }
      if (filters.minPrice !== undefined) {
        filteredMaterials = filteredMaterials.filter(m => parseFloat(m.price) >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        filteredMaterials = filteredMaterials.filter(m => parseFloat(m.price) <= filters.maxPrice!);
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredMaterials = filteredMaterials.filter(m => 
          m.name.toLowerCase().includes(searchTerm) ||
          m.brand.toLowerCase().includes(searchTerm) ||
          m.description?.toLowerCase().includes(searchTerm)
        );
      }
    }

    return filteredMaterials;
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    // Check for duplicates based on sourceUrl if it exists
    const materialWithUrl = material as InsertMaterial & { sourceUrl?: string };
    if (materialWithUrl.sourceUrl) {
      const existingMaterial = Array.from(this.materials.values()).find(m => 
        (m as any).sourceUrl === materialWithUrl.sourceUrl
      );
      if (existingMaterial) {
        console.log(`Duplicate URL detected: ${materialWithUrl.sourceUrl}. Returning existing material.`);
        return existingMaterial;
      }
    }

    // Check for duplicates based on name + brand + category
    const existingByNameBrand = Array.from(this.materials.values()).find(m => 
      m.name.toLowerCase() === material.name.toLowerCase() &&
      m.brand.toLowerCase() === material.brand.toLowerCase() &&
      m.category === material.category
    );
    
    if (existingByNameBrand) {
      console.log(`Duplicate product detected: ${material.name} by ${material.brand}. Returning existing material.`);
      return existingByNameBrand;
    }

    const id = this.currentMaterialId++;
    const newMaterial: Material = { 
      ...material, 
      id,
      imageUrl: material.imageUrl || null,
      description: material.description || null,
      dimensions: material.dimensions || null,
      inStock: material.inStock || null
    };
    this.materials.set(id, newMaterial);
    return newMaterial;
  }

  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const id = this.currentArticleId++;
    const newArticle: Article = { 
      ...article, 
      id,
      imageUrl: article.imageUrl || null,
      content: article.content ?? null
    };
    this.articles.set(id, newArticle);
    return newArticle;
  }

  async getBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }

  async getBrand(id: number): Promise<Brand | undefined> {
    return this.brands.get(id);
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const id = this.currentBrandId++;
    const newBrand: Brand = { 
      ...brand, 
      id,
      description: brand.description || null,
      website: brand.website || null,
      logoUrl: brand.logoUrl || null
    };
    this.brands.set(id, newBrand);
    return newBrand;
  }
}

// Initialize storage - use Firebase by default for all scraped products
const useFirebase = true; // Always use Firebase for persistent storage

// Initialize storage with fallback to memory storage
export const storage: IStorage = new MemStorage();

console.log('✅ Storage initialized with Memory Storage (Firebase integration available via separate service)');

// Optional: Migrate data from memory to Firebase
if (useFirebase && process.env.MIGRATE_DATA === 'true') {
  const memStorage = new MemStorage();
  (storage as FirebaseStorage).migrateFromMemStorage(memStorage).catch(console.error);
}
