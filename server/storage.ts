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
        title: "Ultimate Guide to Choosing the Perfect Tile",
        description: "Everything you need to know about selecting tiles for your home renovation project.",
        content: "When choosing tiles for your home, consider factors like durability, maintenance, style, and cost...",
        imageUrl: "/images/tile-guide.jpg",
        category: "buyer's guide",
        readTime: 8,
        publishedAt: new Date().toISOString(),
        slug: "ultimate-tile-guide"
      },
      {
        title: "Natural Stone vs Engineered Slabs: Complete Comparison",
        description: "Compare natural stone and engineered slabs to make the best choice for your countertops.",
        content: "Natural stone and engineered slabs each have unique benefits and considerations...",
        imageUrl: "/images/stone-comparison.jpg",
        category: "comparison",
        readTime: 6,
        publishedAt: new Date().toISOString(),
        slug: "stone-vs-engineered-slabs"
      },
      {
        title: "Hardwood Flooring: Performance and Durability Guide",
        description: "Learn about different hardwood species and their performance characteristics.",
        content: "Hardwood flooring offers timeless beauty and can last generations when properly maintained...",
        imageUrl: "/images/hardwood-performance.jpg",
        category: "performance",
        readTime: 10,
        publishedAt: new Date().toISOString(),
        slug: "hardwood-performance-guide"
      },
      {
        title: "Radiant Floor Heating Systems: Complete Installation Guide",
        description: "Everything you need to know about installing radiant floor heating in your home.",
        content: "Radiant floor heating provides comfortable, even heat distribution throughout your home...",
        imageUrl: "/images/radiant-heating.jpg",
        category: "heating guide",
        readTime: 12,
        publishedAt: new Date().toISOString(),
        slug: "radiant-heating-installation"
      },
      {
        title: "Luxury Vinyl vs Traditional Vinyl: Design and Longevity",
        description: "Compare luxury vinyl and traditional vinyl flooring options for your space.",
        content: "Modern vinyl flooring has evolved significantly, offering impressive durability and design options...",
        imageUrl: "/images/vinyl-comparison.jpg",
        category: "design & longevity",
        readTime: 7,
        publishedAt: new Date().toISOString(),
        slug: "luxury-vs-traditional-vinyl"
      }
    ];

    sampleArticles.forEach(article => {
      const newArticle: Article = {
        id: this.currentArticleId++,
        ...article
      };
      this.articles.set(newArticle.id, newArticle);
    });

    console.log(`✅ Initialized with ${sampleArticles.length} sample articles`);
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
    let result = Array.from(this.materials.values());

    if (filters?.category) {
      result = result.filter(m => m.category === filters.category);
    }

    if (filters?.brand) {
      result = result.filter(m => m.brand === filters.brand);
    }

    if (filters?.minPrice !== undefined) {
      result = result.filter(m => parseFloat(m.price) >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      result = result.filter(m => parseFloat(m.price) <= filters.maxPrice!);
    }

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(searchTerm) ||
        m.brand.toLowerCase().includes(searchTerm) ||
        m.description?.toLowerCase().includes(searchTerm)
      );
    }

    return result;
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    return this.materials.get(id);
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    // Check for duplicates
    if (this.isDuplicateProduct(material)) {
      console.log(`⚠️  Duplicate product detected: ${material.name} by ${material.brand} - skipping`);
      // Return the existing material instead of creating a duplicate
      for (const [_, existingMaterial] of this.materials) {
        if (existingMaterial.name === material.name && 
            existingMaterial.brand === material.brand && 
            existingMaterial.category === material.category) {
          return existingMaterial;
        }
      }
    }

    const newMaterial: Material = {
      id: this.currentMaterialId++,
      ...material,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.materials.set(newMaterial.id, newMaterial);
    return newMaterial;
  }

  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }

  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const newArticle: Article = {
      id: this.currentArticleId++,
      ...article,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.articles.set(newArticle.id, newArticle);
    return newArticle;
  }

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
      ...user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser: User = {
      ...existingUser,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserByUid(uid: string, updates: Partial<InsertUser>): Promise<User> {
    const existingUser = await this.getUserByUid(uid);
    if (!existingUser) {
      throw new Error(`User with uid ${uid} not found`);
    }

    const updatedUser: User = {
      ...existingUser,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.users.set(existingUser.id, updatedUser);
    return updatedUser;
  }
}

export const storage = new MemStorage();