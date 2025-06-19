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
          peiRating: 4,
          slipRating: "COF 0.42",
          waterAbsorption: "< 0.5%",
          finish: "Matte",
          materialType: "Porcelain"
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
          peiRating: 2,
          slipRating: "COF 0.38",
          waterAbsorption: "3-7%",
          finish: "Glossy",
          materialType: "Ceramic"
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
          peiRating: 5,
          slipRating: "COF 0.52",
          waterAbsorption: "< 0.5%",
          finish: "Polished",
          materialType: "Porcelain"
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
          thickness: "3cm",
          warranty: "Lifetime",
          edgeOptions: ["Straight", "Beveled", "Bullnose", "Ogee", "Waterfall"],
          slabSize: "126\"x63\"",
          material: "Quartz"
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
          voltage: "120V",
          coverage: "30 SF",
          features: ["WiFi Ready", "Programmable", "Energy Efficient"],
          power: "240W",
          compatibility: ["Tile", "Stone", "Laminate"]
        },
        dimensions: "240W",
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
      // Additional Tiles
      {
        name: "Travertine Natural",
        category: "tiles",
        brand: "Marazzi",
        price: "8.99",
        imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Natural Stone Floor Tile",
        specifications: {
          peiRating: 3,
          slipRating: "COF 0.48",
          waterAbsorption: "2-6%",
          finish: "Honed",
          materialType: "Natural Stone"
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
          peiRating: 1,
          slipRating: "COF 0.35",
          waterAbsorption: "7-10%",
          finish: "Glossy",
          materialType: "Ceramic"
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
          thickness: "3cm",
          warranty: "Lifetime",
          edgeOptions: ["Straight", "Beveled", "Bullnose", "Ogee"],
          slabSize: "126\"x63\"",
          material: "Quartz"
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
          thickness: "2cm",
          warranty: "10 Years",
          edgeOptions: ["Straight", "Beveled", "Bullnose"],
          slabSize: "118\"x55\"",
          material: "Marble"
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
          voltage: "240V",
          coverage: "50 SF",
          features: ["WiFi Ready", "Programmable", "GFCI Protected"],
          power: "500W",
          compatibility: ["Tile", "Stone", "Engineered Wood"]
        },
        dimensions: "500W",
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
        description: "Complete analysis of top-rated porcelain tiles including slip resistance testing, durability comparisons, and installation cost breakdowns.",
        imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Buyer's Guide",
        readTime: 8,
        publishedAt: "Jan 15, 2025",
        slug: "best-porcelain-tiles-2025",
      },
      {
        title: "Top Quartz Slabs Compared",
        description: "Side-by-side specifications from Cambria, Caesarstone, MSI, and Silestone including pricing, patterns, and performance data.",
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Comparison",
        readTime: 12,
        publishedAt: "Jan 12, 2025",
        slug: "top-quartz-slabs-compared",
      },
      {
        title: "Best Carpets for High-Traffic Areas",
        description: "Laboratory-tested durability ratings, stain resistance performance, and long-term maintenance costs for commercial-grade carpets.",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        category: "Performance",
        readTime: 6,
        publishedAt: "Jan 10, 2025",
        slug: "best-carpets-high-traffic",
      },
    ];

    articlesData.forEach(article => {
      const newArticle: Article = { 
        ...article, 
        id: this.currentArticleId++,
        imageUrl: article.imageUrl || null
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
      imageUrl: article.imageUrl || null
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
