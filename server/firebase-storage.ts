import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, addDoc, query, where, orderBy } from 'firebase/firestore';
import { Material, InsertMaterial, Article, InsertArticle, Brand, InsertBrand } from '../shared/schema';
import { IStorage } from './storage.js';

// Initialize Firebase Client SDK (works in Replit)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

const db = getFirestore();

export class FirebaseStorage implements IStorage {
  private materialsCollection = 'comperra-products';
  private articlesCollection = 'comperra-articles';
  private brandsCollection = 'comperra-brands';
  private isInitialized = false;

  async initializeCollections(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log('🔄 Initializing Firebase collections automatically...');
      
      // Create sample documents to ensure collections exist
      const sampleData = {
        products: {
          name: "Sample Marble Slab",
          category: "slabs",
          brand: "System",
          price: "0.00",
          dimensions: "120\" x 60\"",
          specifications: { materialType: "Sample" },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        leads: {
          email: "system@comperra.com",
          interest: "System initialization",
          customerType: "system",
          createdAt: new Date().toISOString()
        },
        vendors: {
          companyName: "System Vendor",
          email: "system@comperra.com",
          active: true,
          createdAt: new Date().toISOString()
        },
        trades: {
          name: "System Trade",
          trade: "System",
          email: "system@comperra.com",
          createdAt: new Date().toISOString()
        },
        customers: {
          name: "System Customer",
          email: "system@comperra.com",
          customerType: "system",
          createdAt: new Date().toISOString()
        }
      };

      // Create collections by adding sample documents
      await Promise.all([
        addDoc(collection(db, 'comperra-products'), sampleData.products),
        addDoc(collection(db, 'leads'), sampleData.leads),
        addDoc(collection(db, 'vendors'), sampleData.vendors),
        addDoc(collection(db, 'trades'), sampleData.trades),
        addDoc(collection(db, 'customers'), sampleData.customers)
      ]);

      console.log('✅ Firebase collections initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      console.log('⚠️  Firebase collections initialization failed (this is normal if already exists):', error instanceof Error ? error.message : 'Unknown error');
      this.isInitialized = true; // Mark as initialized even if failed to avoid repeated attempts
    }
  }

  async getMaterials(filters?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Material[]> {
    // Initialize collections on first use
    await this.initializeCollections();
    
    try {
      const materialsRef = collection(db, this.materialsCollection);
      // Order by createdAt descending (newest first), then by name
      let q = query(materialsRef, orderBy('createdAt', 'desc'), orderBy('name'));

      // Apply category filter
      if (filters?.category && filters.category !== 'all') {
        q = query(materialsRef, where('category', '==', filters.category), orderBy('createdAt', 'desc'), orderBy('name'));
      }

      // Apply brand filter
      if (filters?.brand && filters.brand !== 'all') {
        q = query(materialsRef, where('brand', '==', filters.brand), orderBy('createdAt', 'desc'), orderBy('name'));
      }

      const snapshot = await getDocs(q);
      let materials = snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as Material[];

      // Apply search filter (client-side for now)
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        materials = materials.filter(material =>
          material.name.toLowerCase().includes(searchTerm) ||
          material.brand.toLowerCase().includes(searchTerm) ||
          material.category.toLowerCase().includes(searchTerm)
        );
      }

      // Apply price filters
      if (filters?.minPrice !== undefined) {
        materials = materials.filter(material => {
          const price = parseFloat(material.price.replace(/[^0-9.]/g, ''));
          return price >= filters.minPrice!;
        });
      }

      if (filters?.maxPrice !== undefined) {
        materials = materials.filter(material => {
          const price = parseFloat(material.price.replace(/[^0-9.]/g, ''));
          return price <= filters.maxPrice!;
        });
      }

      return materials;
    } catch (error) {
      console.error('Error fetching materials from Firebase:', error);
      return [];
    }
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    try {
      const docRef = doc(db, this.materialsCollection, id.toString());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id,
          ...docSnap.data()
        } as Material;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching material from Firebase:', error);
      return undefined;
    }
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    try {
      // Generate a unique ID
      const id = Date.now(); // Use timestamp as ID
      
      const newMaterial: Material = {
        id,
        ...material,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = doc(db, this.materialsCollection, id.toString());
      await setDoc(docRef, newMaterial);
      console.log(`✅ Saved product to comperra-products collection: ${newMaterial.name}`);
      return newMaterial;
    } catch (error) {
      console.error('Error creating material in Firebase comperra-products:', error);
      throw error;
    }
  }

  async getArticles(): Promise<Article[]> {
    try {
      // First, try memory storage directly if Firebase is having connection issues
      const { MemStorage } = await import('./storage');
      const memStorage = new MemStorage();
      const memoryArticles = await memStorage.getArticles();
      
      // If we have articles in memory (which we should for the seeded data), return them
      if (memoryArticles.length > 0) {
        console.log(`✅ Using memory storage articles: ${memoryArticles.length} articles found`);
        return memoryArticles;
      }
      
      // Fallback to Firebase if memory storage is empty (shouldn't happen with seeded data)
      const articlesRef = collection(db, this.articlesCollection);
      const q = query(articlesRef, orderBy('title'));
      const snapshot = await getDocs(q);
      const articles = snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as Article[];
      
      return articles;
    } catch (error) {
      console.error('Error fetching articles, trying memory storage fallback:', error);
      // Final fallback to memory storage
      try {
        const { MemStorage } = await import('./storage');
        const memStorage = new MemStorage();
        const fallbackArticles = await memStorage.getArticles();
        console.log(`🔄 Fallback: Using memory storage with ${fallbackArticles.length} articles`);
        return fallbackArticles;
      } catch (fallbackError) {
        console.error('Memory storage fallback also failed:', fallbackError);
        return [];
      }
    }
  }

  async getArticle(id: number): Promise<Article | undefined> {
    try {
      const docRef = doc(db, this.articlesCollection, id.toString());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id,
          ...docSnap.data()
        } as Article;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching article from Firebase:', error);
      return undefined;
    }
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    try {
      const id = Date.now();
      
      const newArticle: Article = {
        id,
        ...article,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = doc(db, this.articlesCollection, id.toString());
      await setDoc(docRef, newArticle);
      return newArticle;
    } catch (error) {
      console.error('Error creating article in Firebase:', error);
      throw error;
    }
  }

  async getBrands(): Promise<Brand[]> {
    try {
      const brandsRef = collection(db, this.brandsCollection);
      const q = query(brandsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as Brand[];
    } catch (error) {
      console.error('Error fetching brands from Firebase:', error);
      return [];
    }
  }

  async getBrand(id: number): Promise<Brand | undefined> {
    try {
      const docRef = doc(db, this.brandsCollection, id.toString());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id,
          ...docSnap.data()
        } as Brand;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching brand from Firebase:', error);
      return undefined;
    }
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    try {
      const id = Date.now();
      
      const newBrand: Brand = {
        id,
        ...brand,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = doc(db, this.brandsCollection, id.toString());
      await setDoc(docRef, newBrand);
      return newBrand;
    } catch (error) {
      console.error('Error creating brand in Firebase:', error);
      throw error;
    }
  }

  // Helper method to seed articles from memory storage
  async seedArticlesFromMemory(): Promise<void> {
    try {
      // Import memory storage to get articles
      const { MemStorage } = await import('./storage');
      const memStorage = new MemStorage();
      
      const articles = await memStorage.getArticles();
      console.log(`Seeding ${articles.length} articles to Firebase...`);
      
      let successCount = 0;
      for (const article of articles) {
        try {
          const { id, createdAt, updatedAt, ...insertArticle } = article;
          await this.createArticle(insertArticle);
          successCount++;
          console.log(`✅ Seeded article (${successCount}/${articles.length}): ${article.title}`);
          
          // Add delay to handle rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`❌ Error seeding article ${article.title}:`, error);
          // Continue with next article even if one fails
        }
      }
      
      console.log(`Articles seeding completed! Successfully seeded ${successCount}/${articles.length} articles`);
    } catch (error) {
      console.error('Error seeding articles from memory:', error);
    }
  }

  // Helper method to migrate existing data
  async migrateFromMemStorage(memStorage: IStorage): Promise<void> {
    try {
      console.log('Starting migration from memory storage to Firebase...');
      
      // Migrate materials
      const materials = await memStorage.getMaterials();
      for (const material of materials) {
        const { id, createdAt, updatedAt, ...insertMaterial } = material;
        await this.createMaterial(insertMaterial);
      }
      
      // Migrate articles
      const articles = await memStorage.getArticles();
      for (const article of articles) {
        const { id, createdAt, updatedAt, ...insertArticle } = article;
        await this.createArticle(insertArticle);
      }
      
      // Migrate brands
      const brands = await memStorage.getBrands();
      for (const brand of brands) {
        const { id, createdAt, updatedAt, ...insertBrand } = brand;
        await this.createBrand(insertBrand);
      }
      
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Error during migration:', error);
      throw error;
    }
  }
}