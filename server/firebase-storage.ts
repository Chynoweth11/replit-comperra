import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Material, InsertMaterial, Article, InsertArticle, Brand, InsertBrand } from '../shared/schema';
import { IStorage } from './storage';

// Initialize Firebase Admin (server-side)
if (!getApps().length) {
  // For production, you would use a service account key
  // For now, we'll use the default initialization
  initializeApp({
    projectId: 'comperra-done'
  });
}

const db = getFirestore();

export class FirebaseStorage implements IStorage {
  private materialsCollection = db.collection('materials');
  private articlesCollection = db.collection('articles');
  private brandsCollection = db.collection('brands');

  async getMaterials(filters?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Material[]> {
    try {
      let query = this.materialsCollection.orderBy('name');

      // Apply category filter
      if (filters?.category && filters.category !== 'all') {
        query = query.where('category', '==', filters.category);
      }

      // Apply brand filter
      if (filters?.brand && filters.brand !== 'all') {
        query = query.where('brand', '==', filters.brand);
      }

      const snapshot = await query.get();
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
      const doc = await this.materialsCollection.doc(id.toString()).get();
      if (doc.exists) {
        return {
          id,
          ...doc.data()
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
      const docRef = this.materialsCollection.doc();
      const id = parseInt(docRef.id.slice(-8), 16); // Convert part of doc ID to number
      
      const newMaterial: Material = {
        id,
        ...material,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await docRef.set(newMaterial);
      return newMaterial;
    } catch (error) {
      console.error('Error creating material in Firebase:', error);
      throw error;
    }
  }

  async getArticles(): Promise<Article[]> {
    try {
      const snapshot = await this.articlesCollection.orderBy('title').get();
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id),
        ...doc.data()
      })) as Article[];
    } catch (error) {
      console.error('Error fetching articles from Firebase:', error);
      return [];
    }
  }

  async getArticle(id: number): Promise<Article | undefined> {
    try {
      const doc = await this.articlesCollection.doc(id.toString()).get();
      if (doc.exists) {
        return {
          id,
          ...doc.data()
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
      const docRef = this.articlesCollection.doc();
      const id = parseInt(docRef.id.slice(-8), 16);
      
      const newArticle: Article = {
        id,
        ...article,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await docRef.set(newArticle);
      return newArticle;
    } catch (error) {
      console.error('Error creating article in Firebase:', error);
      throw error;
    }
  }

  async getBrands(): Promise<Brand[]> {
    try {
      const snapshot = await this.brandsCollection.orderBy('name').get();
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
      const doc = await this.brandsCollection.doc(id.toString()).get();
      if (doc.exists) {
        return {
          id,
          ...doc.data()
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
      const docRef = this.brandsCollection.doc();
      const id = parseInt(docRef.id.slice(-8), 16);
      
      const newBrand: Brand = {
        id,
        ...brand,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await docRef.set(newBrand);
      return newBrand;
    } catch (error) {
      console.error('Error creating brand in Firebase:', error);
      throw error;
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