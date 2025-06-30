import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, addDoc, query, where, orderBy } from 'firebase/firestore';
import { Material, InsertMaterial, Article, InsertArticle, Brand, InsertBrand } from '../shared/schema';
import { IStorage } from './storage';

// Initialize Firebase Client SDK (works in Replit)
const firebaseConfig = {
  apiKey: "AIzaSyC7zXxEiPi77xZt2bPY1jcxt9fJcYxKk94",
  authDomain: "comperra-done.firebaseapp.com",
  projectId: "comperra-done",
  storageBucket: "comperra-done.firebasestorage.app",
  messagingSenderId: "636329572028",
  appId: "1:636329572028:web:0c8fd582b0372411c142b9",
  measurementId: "G-SBT7935DTH"
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

  async getMaterials(filters?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Material[]> {
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
      const articlesRef = collection(db, this.articlesCollection);
      const q = query(articlesRef, orderBy('title'));
      const snapshot = await getDocs(q);
      const articles = snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as Article[];
      
      // Auto-seed articles if none exist and connection is working
      if (articles.length === 0 && !this.isInitialized) {
        console.log('No articles found in Firebase, seeding from memory storage...');
        await this.seedArticlesFromMemory();
        this.isInitialized = true;
        // Try to get seeded articles
        try {
          const seededSnapshot = await getDocs(q);
          const seededArticles = seededSnapshot.docs.map(doc => ({
            id: parseInt(doc.id),
            ...doc.data()
          })) as Article[];
          if (seededArticles.length > 0) {
            return seededArticles;
          }
        } catch (seedError) {
          console.log('Firebase seeding failed, falling back to memory storage');
        }
      }
      
      // If Firebase connection issues or no articles, fallback to memory storage
      if (articles.length === 0) {
        console.log('🔄 Firebase unavailable, falling back to memory storage for articles');
        const { MemStorage } = await import('./storage');
        const memStorage = new MemStorage();
        return await memStorage.getArticles();
      }
      
      return articles;
    } catch (error) {
      console.error('Error fetching articles from Firebase, falling back to memory storage:', error);
      // Fallback to memory storage when Firebase fails
      try {
        const { MemStorage } = await import('./storage');
        const memStorage = new MemStorage();
        return await memStorage.getArticles();
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