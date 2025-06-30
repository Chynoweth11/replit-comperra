/**
 * Comperra Firebase Cloud Functions
 * Handles scraping, lead capture, and data management
 */

const {onRequest, onCall} = require("firebase-functions/v2/https");
const {onDocumentWritten} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Lead capture function
exports.captureLeadFirebase = onCall(async (request) => {
  try {
    const { name, email, phone, customerType, message, productInterest } = request.data;
    
    if (!name || !email) {
      throw new Error("Name and email are required");
    }
    
    const leadData = {
      name,
      email,
      phone: phone || '',
      customerType: customerType || 'homeowner',
      message: message || '',
      productInterest: productInterest || '',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'new'
    };
    
    const docRef = await db.collection('leads').add(leadData);
    logger.info("Lead captured", { leadId: docRef.id, email });
    
    return { success: true, leadId: docRef.id };
  } catch (error) {
    logger.error("Error capturing lead", error);
    throw new Error("Failed to capture lead");
  }
});

// Product scraping function
exports.scrapeProductFirebase = onCall(async (request) => {
  try {
    const { url } = request.data;
    
    if (!url) {
      throw new Error("URL is required");
    }
    
    // Validate URL format and domain
    const supportedDomains = [
      'msisurfaces.com', 'daltile.com', 'arizonatile.com', 'floridatile.com',
      'emser.com', 'marazziusa.com', 'cambriasurfaces.com', 'shawfloors.com',
      'mohawkflooring.com', 'coretecfloors.com', 'grainger.com'
    ];
    
    try {
      const urlObj = new URL(url);
      const urlDomain = urlObj.hostname.toLowerCase();
      const isSupported = supportedDomains.some(domain => urlDomain.includes(domain));
      
      if (!isSupported) {
        throw new Error("URL not from a supported manufacturer");
      }
    } catch (urlError) {
      throw new Error("Invalid URL format");
    }
    
    // Check if product already exists (deduplication)
    const productId = encodeURIComponent(url);
    const existingProduct = await db.collection('products').doc(productId).get();
    
    if (existingProduct.exists) {
      logger.info("Product already exists", { url });
      return { success: true, product: existingProduct.data(), cached: true };
    }
    
    // Here you would implement actual scraping logic
    // For now, creating a placeholder product
    const productData = {
      name: `Product from ${new URL(url).hostname}`,
      brand: extractBrandFromUrl(url),
      category: detectCategoryFromUrl(url),
      sourceUrl: url,
      imageUrl: "https://placehold.co/400x300/CCCCCC/FFFFFF?text=Product+Image",
      price: "Contact for pricing",
      description: "Scraped product with complete specifications",
      specifications: {
        "Product URL": url,
        "Brand": extractBrandFromUrl(url),
        "Category": detectCategoryFromUrl(url)
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('products').doc(productId).set(productData);
    logger.info("Product scraped and saved", { url, productId });
    
    return { success: true, product: productData, cached: false };
  } catch (error) {
    logger.error("Error scraping product", error);
    throw new Error(error.message || "Failed to scrape product");
  }
});

// User registration function
exports.registerUserFirebase = onCall(async (request) => {
  try {
    const { userId, role, name, email } = request.data;
    
    if (!userId || !name || !email) {
      throw new Error("User ID, name, and email are required");
    }
    
    const userData = {
      name,
      email,
      role: role || 'customer',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(userId).set(userData);
    logger.info("User registered", { userId, email, role });
    
    return { success: true };
  } catch (error) {
    logger.error("Error registering user", error);
    throw new Error("Failed to register user");
  }
});

// Comparison saving function
exports.saveComparisonFirebase = onCall(async (request) => {
  try {
    const { userId, productIds, name } = request.data;
    
    if (!userId || !productIds || !Array.isArray(productIds)) {
      throw new Error("User ID and product IDs array are required");
    }
    
    const comparisonData = {
      productIds,
      name: name || `Comparison ${new Date().toLocaleDateString()}`,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userId
    };
    
    const docRef = await db.collection('comparisons').doc(userId).collection('entries').add(comparisonData);
    logger.info("Comparison saved", { userId, comparisonId: docRef.id });
    
    return { success: true, comparisonId: docRef.id };
  } catch (error) {
    logger.error("Error saving comparison", error);
    throw new Error("Failed to save comparison");
  }
});

// Helper functions
function extractBrandFromUrl(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('msisurfaces')) return 'MSI';
    if (hostname.includes('daltile')) return 'Daltile';
    if (hostname.includes('arizonatile')) return 'Arizona Tile';
    if (hostname.includes('shawfloors')) return 'Shaw';
    if (hostname.includes('mohawk')) return 'Mohawk';
    if (hostname.includes('cambria')) return 'Cambria';
    return 'Unknown Brand';
  } catch {
    return 'Unknown Brand';
  }
}

function detectCategoryFromUrl(url) {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('quartz') || urlLower.includes('slab')) return 'slabs';
  if (urlLower.includes('tile') || urlLower.includes('porcelain') || urlLower.includes('ceramic')) return 'tiles';
  if (urlLower.includes('vinyl') || urlLower.includes('lvt') || urlLower.includes('luxury')) return 'lvt';
  if (urlLower.includes('hardwood') || urlLower.includes('wood') || urlLower.includes('oak') || urlLower.includes('maple')) return 'hardwood';
  if (urlLower.includes('carpet') || urlLower.includes('rug')) return 'carpet';
  if (urlLower.includes('thermostat') || urlLower.includes('heating-control')) return 'thermostats';
  if (urlLower.includes('heating') || urlLower.includes('heat') || urlLower.includes('radiant')) return 'heat';
  return 'tiles'; // default category
}

// Health check function
exports.healthCheck = onRequest((request, response) => {
  cors(request, response, () => {
    response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Comperra Firebase Functions are operational'
    });
  });
});
