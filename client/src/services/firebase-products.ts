import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';

// 🔧 1. saveProductIfNew(url, scrapedData) — Deduplicated Scraping
export async function saveProductIfNew(url: string, scrapedData: any) {
  const productId = encodeURIComponent(url); // Unique Firestore-safe ID

  const productRef = doc(db, "products", productId);
  const existing = await getDoc(productRef);

  if (existing.exists()) {
    console.log("✅ Product already saved. Using cached version.");
    return existing.data();
  }

  const productToSave = {
    ...scrapedData,
    sourceUrl: url,
    createdAt: new Date()
  };

  await setDoc(productRef, productToSave);
  console.log("✅ Product saved to Firestore.");
  return productToSave;
}

// 🔍 2. scrapeProduct(url) — Use Saved or Scrape Live
export async function scrapeProduct(url: string) {
  const response = await fetch(`/api/scrape/single`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message);
  }
  
  const savedProduct = await saveProductIfNew(url, result.product);
  return savedProduct;
}

// 🧩 3. addLead(name, email, message)
export async function addLead(name: string, email: string, message: string) {
  await addDoc(collection(db, "leads"), {
    name,
    email,
    message,
    timestamp: new Date()
  });
}

// 🛠️ 4. registerUser(user) — Customer, Vendor, Trade Pro
export async function registerUser(userId: string, role: string, name: string, email: string) {
  await setDoc(doc(db, "users", userId), {
    name,
    email,
    role, // "customer", "vendor", or "trade-pro"
    createdAt: new Date()
  });
}

// 🧾 5. submitVendorApplication(data)
export async function submitVendorApplication(data: any) {
  await addDoc(collection(db, "vendorApps"), {
    ...data,
    status: "pending",
    submittedAt: new Date()
  });
}

// 🔄 6. saveComparison(userId, productIds)
export async function saveComparison(userId: string, productIds: string[]) {
  const comparisonRef = doc(collection(db, `comparisons/${userId}/entries`));
  await setDoc(comparisonRef, {
    productIds,
    timestamp: new Date()
  });
}