import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, ilike, gte, lte } from "drizzle-orm";
import { 
  materials, 
  articles, 
  brands,
  users,
  leads,
  type Material, 
  type InsertMaterial,
  type Article,
  type InsertArticle,
  type Brand,
  type InsertBrand,
  type User,
  type InsertUser,
  type Lead,
  type InsertLead
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

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

  // Leads
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, updates: Partial<InsertLead>): Promise<Lead>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    console.log('✅ Database storage initialized with PostgreSQL');
    
    // Initialize with sample articles to prevent "Article Not Found" errors
    this.initializeSampleArticles();
  }

  private async initializeSampleArticles() {
    try {
      // Check if articles already exist
      const existingArticles = await db.select().from(articles).limit(1);
      if (existingArticles.length > 0) {
        console.log('✅ Articles already exist in database');
        return;
      }

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

      await db.insert(articles).values(sampleArticles);
      console.log(`✅ Initialized with ${sampleArticles.length} comprehensive articles`);
    } catch (error) {
      console.log('ℹ️  Articles may already be initialized or database not ready:', error);
    }
  }

  // Duplicate prevention method
  private async isDuplicateProduct(material: InsertMaterial): Promise<boolean> {
    try {
      const existing = await db.select().from(materials)
        .where(and(
          eq(materials.name, material.name),
          eq(materials.brand, material.brand),
          eq(materials.category, material.category)
        ))
        .limit(1);
      return existing.length > 0;
    } catch (error) {
      console.error('Error checking for duplicate:', error);
      return false;
    }
  }

  async getMaterials(filters?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Material[]> {
    try {
      console.log('Raw filters:', filters);
      
      // Clean up filters
      const cleanFilters: any = {};
      if (filters?.category && filters.category !== 'all') cleanFilters.category = filters.category;
      if (filters?.brand && filters.brand !== 'all') cleanFilters.brand = filters.brand;
      if (filters?.minPrice !== undefined) cleanFilters.minPrice = filters.minPrice;
      if (filters?.maxPrice !== undefined) cleanFilters.maxPrice = filters.maxPrice;
      if (filters?.search) cleanFilters.search = filters.search;
      
      console.log('Clean filters:', cleanFilters);

      let query = db.select().from(materials);
      const conditions = [];

      // Apply filters
      if (cleanFilters.category) {
        conditions.push(ilike(materials.category, cleanFilters.category));
      }

      if (cleanFilters.brand) {
        conditions.push(ilike(materials.brand, cleanFilters.brand));
      }

      if (cleanFilters.minPrice !== undefined) {
        conditions.push(gte(materials.price, cleanFilters.minPrice.toString()));
      }

      if (cleanFilters.maxPrice !== undefined) {
        conditions.push(lte(materials.price, cleanFilters.maxPrice.toString()));
      }

      if (cleanFilters.search) {
        const searchTerm = `%${cleanFilters.search}%`;
        conditions.push(
          ilike(materials.name, searchTerm)
        );
      }

      let results;
      if (conditions.length > 0) {
        results = await db.select().from(materials).where(and(...conditions));
      } else {
        results = await db.select().from(materials);
      }
      console.log(`Found ${results.length} materials for category: ${cleanFilters.category || 'all'}`);
      return results;
    } catch (error) {
      console.error('Error fetching materials:', error);
      return [];
    }
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    try {
      const result = await db.select().from(materials).where(eq(materials.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching material:', error);
      return undefined;
    }
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    try {
      if (await this.isDuplicateProduct(material)) {
        console.log(`⚠️ Duplicate product detected: ${material.name} by ${material.brand}`);
        const existing = await db.select().from(materials)
          .where(and(
            eq(materials.name, material.name),
            eq(materials.brand, material.brand),
            eq(materials.category, material.category)
          ))
          .limit(1);
        return existing[0];
      }

      const materialWithTimestamps = {
        ...material,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await db.insert(materials).values(materialWithTimestamps).returning();
      const newMaterial = result[0];
      console.log(`✅ Added material: ${newMaterial.name} by ${newMaterial.brand}`);
      return newMaterial;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  }

  // Articles
  async getArticles(): Promise<Article[]> {
    try {
      return await db.select().from(articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }

  async getArticle(id: number): Promise<Article | undefined> {
    try {
      const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching article:', error);
      return undefined;
    }
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    try {
      const result = await db.insert(articles).values(article).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating article:', error);
      throw error;
    }
  }

  // Brands
  async getBrands(): Promise<Brand[]> {
    try {
      return await db.select().from(brands);
    } catch (error) {
      console.error('Error fetching brands:', error);
      return [];
    }
  }

  async getBrand(id: number): Promise<Brand | undefined> {
    try {
      const result = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching brand:', error);
      return undefined;
    }
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    try {
      const result = await db.insert(brands).values(brand).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return undefined;
    }
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching user by uid:', error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const userWithTimestamps = {
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const result = await db.insert(users).values(userWithTimestamps).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    try {
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      const result = await db.update(users)
        .set(updatesWithTimestamp)
        .where(eq(users.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error(`User with id ${id} not found`);
      }
      return result[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async updateUserByUid(uid: string, updates: Partial<InsertUser>): Promise<User> {
    try {
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      const result = await db.update(users)
        .set(updatesWithTimestamp)
        .where(eq(users.uid, uid))
        .returning();
      
      if (result.length === 0) {
        throw new Error(`User with uid ${uid} not found`);
      }
      return result[0];
    } catch (error) {
      console.error('Error updating user by uid:', error);
      throw error;
    }
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    try {
      return await db.select().from(leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      return [];
    }
  }

  async getLead(id: string): Promise<Lead | undefined> {
    try {
      const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error('Error fetching lead:', error);
      return undefined;
    }
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    try {
      const leadWithTimestamps = {
        ...lead,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const result = await db.insert(leads).values(leadWithTimestamps).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  async updateLead(id: string, updates: Partial<InsertLead>): Promise<Lead> {
    try {
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      const result = await db.update(leads)
        .set(updatesWithTimestamp)
        .where(eq(leads.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error(`Lead with id ${id} not found`);
      }
      return result[0];
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();