import { 
  materials, 
  articles, 
  brands,
  users,
  type Material, 
  type InsertMaterial,
  type Article,
  type InsertArticle,
  type Brand,
  type InsertBrand,
  type User,
  type InsertUser
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

  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  updateUserByUid(uid: string, updates: Partial<InsertUser>): Promise<User>;
}

export class MemStorage implements IStorage {
  private materials: Map<number, Material>;
  private articles: Map<number, Article>;
  private brands: Map<number, Brand>;
  private users: Map<number, User>;
  private currentMaterialId: number;
  private currentArticleId: number;
  private currentBrandId: number;
  private currentUserId: number;

  constructor() {
    this.materials = new Map();
    this.articles = new Map();
    this.brands = new Map();
    this.users = new Map();
    this.currentMaterialId = 1;
    this.currentArticleId = 1;
    this.currentBrandId = 1;
    this.currentUserId = 1;
    console.log('✅ Storage initialized with empty product database - ready for fresh scraping');
    
    // Initialize with sample articles to prevent "Article Not Found" errors
    this.initializeSampleArticles();
  }

  private initializeSampleArticles() {
    const sampleArticles = [
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
      }
    ];

    sampleArticles.forEach((articleData, index) => {
      const article: Article = {
        id: this.currentArticleId++,
        title: articleData.title,
        description: articleData.description,
        content: articleData.content,
        imageUrl: articleData.imageUrl,
        category: articleData.category,
        readTime: articleData.readTime,
        publishedAt: articleData.publishedAt,
        slug: articleData.slug
      };
      this.articles.set(article.id, article);
    });

    console.log(`✅ Initialized with ${sampleArticles.length} comprehensive articles`);
  }

  // Duplicate prevention method
  private isDuplicateProduct(material: InsertMaterial): boolean {
    for (const [_, existingMaterial] of this.materials) {
      if (existingMaterial.name === material.name && 
          existingMaterial.brand === material.brand && 
          existingMaterial.category === material.category) {
        return true;
      }
    }
    return false;
  }

  async getMaterials(filters?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Material[]> {
    console.log('Raw filters:', filters);
    
    // Clean up filters
    const cleanFilters: any = {};
    if (filters?.category && filters.category !== 'all') cleanFilters.category = filters.category;
    if (filters?.brand && filters.brand !== 'all') cleanFilters.brand = filters.brand;
    if (filters?.minPrice !== undefined) cleanFilters.minPrice = filters.minPrice;
    if (filters?.maxPrice !== undefined) cleanFilters.maxPrice = filters.maxPrice;
    if (filters?.search) cleanFilters.search = filters.search;
    
    console.log('Clean filters:', cleanFilters);

    let results = Array.from(this.materials.values());

    // Apply filters
    if (cleanFilters.category) {
      results = results.filter(material => 
        material.category.toLowerCase() === cleanFilters.category.toLowerCase()
      );
    }

    if (cleanFilters.brand) {
      results = results.filter(material => 
        material.brand.toLowerCase() === cleanFilters.brand.toLowerCase()
      );
    }

    if (cleanFilters.minPrice !== undefined) {
      results = results.filter(material => material.price >= cleanFilters.minPrice);
    }

    if (cleanFilters.maxPrice !== undefined) {
      results = results.filter(material => material.price <= cleanFilters.maxPrice);
    }

    if (cleanFilters.search) {
      const searchTerm = cleanFilters.search.toLowerCase();
      results = results.filter(material =>
        material.name.toLowerCase().includes(searchTerm) ||
        material.description.toLowerCase().includes(searchTerm) ||
        material.brand.toLowerCase().includes(searchTerm)
      );
    }

    console.log(`Found ${results.length} materials for category: ${cleanFilters.category || 'all'}`);
    return results;
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    if (this.isDuplicateProduct(material)) {
      console.log(`⚠️ Duplicate product detected: ${material.name} by ${material.brand}`);
      const existing = Array.from(this.materials.values()).find(m => 
        m.name === material.name && m.brand === material.brand && m.category === material.category
      );
      return existing!;
    }

    const newMaterial: Material = {
      id: this.currentMaterialId++,
      ...material
    };
    this.materials.set(newMaterial.id, newMaterial);
    console.log(`✅ Added material: ${newMaterial.name} by ${newMaterial.brand}`);
    return newMaterial;
  }

  // Articles
  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const newArticle: Article = {
      id: this.currentArticleId++,
      ...article
    };
    this.articles.set(newArticle.id, newArticle);
    return newArticle;
  }

  // Brands
  async getBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }

  async getBrand(id: number): Promise<Brand | undefined> {
    return this.brands.get(id);
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const newBrand: Brand = {
      id: this.currentBrandId++,
      ...brand
    };
    this.brands.set(newBrand.id, newBrand);
    return newBrand;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.uid === uid) {
        return user;
      }
    }
    return undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.currentUserId++,
      ...user
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserByUid(uid: string, updates: Partial<InsertUser>): Promise<User> {
    for (const [id, user] of this.users.entries()) {
      if (user.uid === uid) {
        const updatedUser = { ...user, ...updates };
        this.users.set(id, updatedUser);
        return updatedUser;
      }
    }
    throw new Error(`User with uid ${uid} not found`);
  }
}

export const storage = new MemStorage();