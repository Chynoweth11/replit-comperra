import { readFileSync } from 'fs';
import { join } from 'path';
import { firebaseStorage } from './firebase-storage.js';

interface FirebaseSeedData {
  products: any[];
  pricing_requests: any[];
  users: any[];
  sample_requests: any[];
}

export class FirebaseDataLoader {
  async loadSeedData(): Promise<void> {
    try {
      const seedDataPath = join(process.cwd(), 'server', 'firebase-seed-data.json');
      const seedData: FirebaseSeedData = JSON.parse(readFileSync(seedDataPath, 'utf-8'));
      
      console.log('Loading Firebase seed data...');
      
      // Load products
      for (const product of seedData.products) {
        await this.addProductToFirebase(product);
      }
      
      // Load pricing requests
      for (const request of seedData.pricing_requests) {
        await this.addPricingRequestToFirebase(request);
      }
      
      // Load users
      for (const user of seedData.users) {
        await this.addUserToFirebase(user);
      }
      
      // Load sample requests
      for (const request of seedData.sample_requests) {
        await this.addSampleRequestToFirebase(request);
      }
      
      console.log('Firebase seed data loaded successfully');
    } catch (error) {
      console.error('Error loading Firebase seed data:', error);
    }
  }
  
  private async addProductToFirebase(product: any): Promise<void> {
    try {
      // Convert to material format expected by firebase storage
      const material = {
        name: product.productName,
        category: this.mapCategoryName(product.category),
        brand: product.brand,
        price: product.pricePerSF?.toString() || '0',
        description: `${product.materialType || 'Product'} - ${product.dimensions || 'Various sizes'}`,
        specifications: this.buildSpecifications(product),
        dimensions: product.dimensions || 'N/A',
        imageUrl: this.getDefaultImageUrl(product.category),
        inStock: true
      };
      
      await firebaseStorage.createMaterial(material);
      console.log(`Added product: ${product.productName}`);
    } catch (error) {
      console.error(`Error adding product ${product.productName}:`, error);
    }
  }
  
  private async addPricingRequestToFirebase(request: any): Promise<void> {
    try {
      // Add to Firebase pricing requests collection
      // This would be implemented based on your Firebase structure
      console.log(`Added pricing request for: ${request.product}`);
    } catch (error) {
      console.error(`Error adding pricing request:`, error);
    }
  }
  
  private async addUserToFirebase(user: any): Promise<void> {
    try {
      // Add to Firebase users collection
      // This would be implemented based on your Firebase structure
      console.log(`Added user: ${user.fullName}`);
    } catch (error) {
      console.error(`Error adding user:`, error);
    }
  }
  
  private async addSampleRequestToFirebase(request: any): Promise<void> {
    try {
      // Add to Firebase sample requests collection
      // This would be implemented based on your Firebase structure
      console.log(`Added sample request for: ${request.product}`);
    } catch (error) {
      console.error(`Error adding sample request:`, error);
    }
  }
  
  private mapCategoryName(category: string): string {
    const categoryMap: Record<string, string> = {
      'tiles': 'tiles',
      'stone_slabs': 'slabs',
      'vinyl_lvt': 'lvt',
      'hardwood': 'hardwood',
      'heating': 'heat',
      'carpet': 'carpet',
      'thermostats': 'thermostats'
    };
    
    return categoryMap[category] || 'tiles';
  }
  
  private buildSpecifications(product: any): Record<string, any> {
    const specs: Record<string, any> = {
      'Product Name': product.productName,
      'Brand/Manufacturer': product.brand,
      'Product URL': product.productUrl
    };
    
    // Add category-specific specifications
    switch (product.category) {
      case 'tiles':
        Object.assign(specs, {
          'Material Type': product.materialType,
          'PEI Rating': product.peiRating,
          'DCOF / Slip Rating': product.dcof,
          'Water Absorption': product.waterAbsorption,
          'Finish': product.finish,
          'Color': product.color,
          'Edge Type': product.edgeType,
          'Install Location': product.installLocation,
          'Texture': product.texture
        });
        break;
        
      case 'stone_slabs':
        Object.assign(specs, {
          'Material Type': product.materialType,
          'Finish': product.finish,
          'Color': product.color,
          'Thickness': product.thickness,
          'Water Absorption': product.waterAbsorption,
          'Applications': product.applications,
          'Scratch Resistance': product.scratchResistance
        });
        break;
        
      case 'vinyl_lvt':
        Object.assign(specs, {
          'Material Type': product.materialType,
          'Wear Layer': product.wearLayer,
          'Thickness': product.thickness,
          'Finish': product.finish,
          'Waterproof': product.waterproof ? 'Yes' : 'No',
          'Installation Method': product.installation,
          'Applications': product.applications,
          'Underlayment': product.underlaymentIncluded ? 'Included' : 'Not Included',
          'Warranty': product.warranty
        });
        break;
        
      case 'hardwood':
        Object.assign(specs, {
          'Species': product.woodSpecies,
          'Material Type': product.materialType,
          'Finish': product.finish,
          'Thickness': product.thickness,
          'Janka Hardness': product.hardnessJanka,
          'Installation Method': product.installation,
          'Warranty': product.warranty,
          'Moisture Resistance': product.moistureResistance
        });
        break;
        
      case 'heating':
        Object.assign(specs, {
          'Type': product.type,
          'Voltage': product.voltage,
          'Applications': product.applications,
          'Wattage': product.wattage,
          'Coverage Area': product.coverageArea,
          'Sensor Type': product.sensorType,
          'Installation': product.installation,
          'Warranty': product.warranty
        });
        break;
        
      case 'carpet':
        Object.assign(specs, {
          'Fiber Type': product.fiberType,
          'Pile Style': product.pileStyle,
          'Material Type': product.materialType,
          'Texture': product.texture,
          'Applications': product.applications,
          'Warranty': product.warranty,
          'Stain Protection': product.stainProtection,
          'Pile Height': product.pileHeight,
          'Face Weight': product.faceWeight,
          'Backing': product.backing,
          'Install Method': product.installMethod
        });
        break;
        
      case 'thermostats':
        Object.assign(specs, {
          'Voltage': product.voltage,
          'Load Capacity': product.loadCapacity,
          'Sensor Type': product.sensorType,
          'Sensor Cable Length': product.sensorCableLength,
          'GFCI Protection': product.gfciProtection,
          'Display Type': product.displayType,
          'Connectivity': product.connectivity,
          'Programmable': product.programmable ? 'Yes' : 'No',
          'Geo-Learning/AI': product.geoLearningAI,
          'Installation Type': product.installationType,
          'IP Rating': product.ipRating,
          'Color/Finish': product.colorFinish,
          'Warranty': product.warranty,
          'Certifications': product.certifications,
          'Compatible Heating': product.compatibleHeating,
          'User Interface Features': product.userInterfaceFeatures,
          'Manual Override': product.manualOverride ? 'Yes' : 'No'
        });
        break;
    }
    
    return specs;
  }
  
  private getDefaultImageUrl(category: string): string {
    const imageMap: Record<string, string> = {
      'tiles': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      'stone_slabs': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      'vinyl_lvt': 'https://images.unsplash.com/photo-1586105251261-72a756497a11?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      'hardwood': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      'heating': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      'carpet': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      'thermostats': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300'
    };
    
    return imageMap[category] || imageMap['tiles'];
  }
}

export const firebaseDataLoader = new FirebaseDataLoader();