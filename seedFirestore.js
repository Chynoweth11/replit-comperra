import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7zXxEiPi77xZt2bPY1jcxt9fJcYxKk94",
  authDomain: "comperra-done.firebaseapp.com",
  projectId: "comperra-done",
  storageBucket: "comperra-done.firebasestorage.app",
  messagingSenderId: "636329572028",
  appId: "1:636329572028:web:0c8fd582b0372411c142b9",
  measurementId: "G-SBT7935DTH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedFirestore() {
  try {
    console.log("🔄 Starting Firebase collection creation...");

    // Products collection
    console.log("Creating comperra-products collection...");
    await addDoc(collection(db, "comperra-products"), {
      name: "Carrara White Marble",
      category: "slabs",
      finish: "Polished",
      price: "10.99",
      dimensions: "120\" x 60\"",
      materialType: "Natural Marble",
      brand: "Sample Brand",
      specifications: {
        finish: "Polished",
        thickness: "3cm",
        materialType: "Natural Marble",
        applications: "Countertops, Backsplash"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Leads collection
    console.log("Creating leads collection...");
    await addDoc(collection(db, "leads"), {
      email: "customer@example.com",
      phone: "555-555-5555",
      interest: "Granite",
      customerType: "homeowner",
      zipCode: "85001",
      createdAt: new Date().toISOString()
    });

    // Vendors collection
    console.log("Creating vendors collection...");
    await addDoc(collection(db, "vendors"), {
      companyName: "StoneX USA",
      email: "vendor@example.com",
      subscriptionPlan: "Premium",
      active: true,
      createdAt: new Date().toISOString()
    });

    // Trades collection
    console.log("Creating trades collection...");
    await addDoc(collection(db, "trades"), {
      name: "John Installer",
      trade: "Tile Installer",
      phone: "602-111-2222",
      email: "john@trades.com",
      createdAt: new Date().toISOString()
    });

    // Customers collection
    console.log("Creating customers collection...");
    await addDoc(collection(db, "customers"), {
      name: "Jane Buyer",
      email: "jane@buyers.com",
      phone: "480-999-1234",
      preferences: ["Porcelain", "Quartz"],
      customerType: "homeowner",
      createdAt: new Date().toISOString()
    });

    console.log("✅ All collections created automatically and seeded successfully!");
    console.log("📊 Collections created:");
    console.log("   - comperra-products");
    console.log("   - leads");
    console.log("   - vendors");
    console.log("   - trades");
    console.log("   - customers");

  } catch (error) {
    console.error("❌ Error seeding Firestore:", error);
    throw error;
  }
}

seedFirestore().catch(console.error);