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
          wearLayer: "20 mil",
          coreType: "SPC Core",
          waterproof: true,
          installMethod: "Floating",
          texture: "Embossed"
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
          species: "Red Oak",
          finishType: "Pre-Finished",
          plankWidth: "3.25\"",
          thickness: "3/4\"",
          construction: "Solid"
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
          'Device Type': 'Smart WiFi Thermostat',
          'Voltage': '120V/240V',
          'Load Capacity': '15A',
          'Sensor Type': 'Floor/Air Sensor',
          'GFCI Protection': 'GFCI Protected',
          'Display Type': 'Color Touchscreen',
          'Connectivity': 'WiFi Enabled',
          'Installation Type': 'In-Wall Installation',
          'Warranty': '3 Years'
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
          wearLayer: "22 mil",
          coreType: "WPC Core",
          waterproof: true,
          installMethod: "Floating",
          texture: "Wood Grain"
        },
        dimensions: "7\"x48\"",
        inStock: true,
      },
      {
        name: "Stone Creek Slate",
        category: "lvt",
        brand: "Shaw",
        price: "3.29",
        imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Stone Look LVT",
        specifications: {
          wearLayer: "18 mil",
          coreType: "SPC Core",
          waterproof: true,
          installMethod: "Glue Down",
          texture: "Stone Texture"
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

export const storage = new MemStorage();
