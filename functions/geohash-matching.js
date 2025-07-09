// =====================
// Firebase Cloud Functions with Geohashing (Optimized)
// =====================

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const geolib = require("geolib");
const geofire = require("geofire-common");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// 📍 Expanded ZIP to coordinates mapping for broader coverage
const zipDb = {
  // Arizona
  "85001": { latitude: 33.45, longitude: -112.07 },
  "85281": { latitude: 33.42, longitude: -111.93 },
  "86001": { latitude: 35.2, longitude: -111.65 },
  "86004": { latitude: 35.21, longitude: -111.82 },
  "86301": { latitude: 34.54, longitude: -112.47 },
  
  // California
  "90210": { latitude: 34.0901, longitude: -118.4065 },
  "90024": { latitude: 34.0628, longitude: -118.4426 },
  "91101": { latitude: 34.1478, longitude: -118.1445 },
  "92101": { latitude: 32.7157, longitude: -117.1611 },
  "94102": { latitude: 37.7749, longitude: -122.4194 },
  
  // Colorado
  "80202": { latitude: 39.7547, longitude: -105.0178 },
  "80301": { latitude: 40.0150, longitude: -105.2705 },
  "80904": { latitude: 38.8339, longitude: -104.8214 },
  
  // Florida
  "33139": { latitude: 25.7907, longitude: -80.1300 },
  "33101": { latitude: 25.7617, longitude: -80.1918 },
  "33301": { latitude: 26.1224, longitude: -80.1373 },
  "32801": { latitude: 28.5383, longitude: -81.3792 },
  
  // Texas
  "75201": { latitude: 32.7811, longitude: -96.7972 },
  "77001": { latitude: 29.7604, longitude: -95.3698 },
  "78701": { latitude: 30.2672, longitude: -97.7431 },
  
  // New York
  "10001": { latitude: 40.7505, longitude: -73.9980 },
  "10002": { latitude: 40.7209, longitude: -73.9876 },
  "11201": { latitude: 40.6928, longitude: -73.9903 },
  
  // Illinois
  "60611": { latitude: 41.8918, longitude: -87.6224 },
  "60601": { latitude: 41.8781, longitude: -87.6298 },
  
  // Georgia
  "30309": { latitude: 33.7901, longitude: -84.3902 },
  "30303": { latitude: 33.7490, longitude: -84.3880 },
  
  // Washington
  "98101": { latitude: 47.6062, longitude: -122.3321 },
  "98102": { latitude: 47.6237, longitude: -122.3017 },
  
  // Massachusetts
  "02108": { latitude: 42.3751, longitude: -71.0603 },
  "02101": { latitude: 42.3584, longitude: -71.0598 },
  
  // Test ZIP codes
  "81620": { latitude: 39.1911, longitude: -106.8175 } // Avon, CO
};

// 🔄 matchUsersByGeo - Efficient geo-query using geohashing
const matchUsersByGeo = async (role, origin, categoryField, category) => {
  const radiusInM = 160934.4; // 100 miles in meters for broader matching
  const center = [origin.latitude, origin.longitude];
  const bounds = geofire.geohashQueryBounds(center, radiusInM);

  const matched = [];

  for (const b of bounds) {
    const snap = await db.collection("users")
      .where("role", "==", role)
      .where("geohash", ">=", b[0])
      .where("geohash", "<=", b[1])
      .where(categoryField, "array-contains", category)
      .get();

    for (const doc of snap.docs) {
      const user = doc.data();
      const distanceInM = geolib.getDistance(center, [user.latitude, user.longitude]);
      const distanceInMi = geolib.convertDistance(distanceInM, "mi");

      // ✔️ Check against personalized radius if provided
      const maxRadius = user.serviceRadius || 50;
      if (distanceInMi <= maxRadius) {
        matched.push({ 
          uid: user.uid, 
          distance: distanceInMi,
          businessName: user.businessName || user.name,
          email: user.email,
          serviceRadius: user.serviceRadius
        });
      }
    }
  }
  
  // Sort by distance (closest first)
  return matched.sort((a, b) => a.distance - b.distance);
};

// 🔄 Auto-match leads when created
exports.autoMatchLead = functions.firestore
  .document("leads/{leadId}")
  .onCreate(async (snap) => {
    const lead = snap.data();
    const { zipCode, materialCategory, type } = lead;

    console.log(`🔄 Auto-matching lead for ${lead.email} in ZIP ${zipCode} for ${materialCategory}`);

    const origin = zipDb[zipCode];
    if (!origin) {
      console.log(`❌ No coordinates found for ZIP: ${zipCode}`);
      await snap.ref.update({ status: "error_no_zip_coords" });
      return;
    }

    try {
      const matchedVendors = await matchUsersByGeo("vendor", origin, "productCategories", materialCategory);
      const matchedTrades = await matchUsersByGeo("trade", origin, "tradeCategories", materialCategory);

      console.log(`✅ Found ${matchedVendors.length} vendors and ${matchedTrades.length} trades for ${lead.email}`);

      await snap.ref.update({
        matchedVendors: matchedVendors.map(v => v.uid),
        matchedTrades: matchedTrades.map(t => t.uid),
        status: "matched",
        vendorDistances: matchedVendors,
        tradeDistances: matchedTrades,
        lastUpdated: new Date().toISOString()
      });

      // Log successful matching
      console.log(`📧 Lead ${snap.id} matched with ${matchedVendors.length + matchedTrades.length} professionals`);
      
    } catch (error) {
      console.error(`❌ Error matching lead ${snap.id}:`, error);
      await snap.ref.update({ 
        status: "error_matching",
        errorMessage: error.message,
        lastUpdated: new Date().toISOString()
      });
    }
  });

// 🔄 Auto-route sample requests to nearest vendor
exports.autoRouteSampleRequest = functions.firestore
  .document("sampleRequests/{requestId}")
  .onCreate(async (snap) => {
    const request = snap.data();
    const { zipCode, materialCategory } = request;

    console.log(`🔄 Auto-routing sample request for ${request.email} in ZIP ${zipCode} for ${materialCategory}`);

    const origin = zipDb[zipCode];
    if (!origin) {
      console.log(`❌ No coordinates found for ZIP: ${zipCode}`);
      await snap.ref.update({ status: "error_no_zip_coords" });
      return;
    }

    try {
      const vendors = await matchUsersByGeo("vendor", origin, "productCategories", materialCategory);
      
      if (vendors.length === 0) {
        console.log(`❌ No vendors found for sample request ${snap.id}`);
        await snap.ref.update({ 
          matchedVendorId: null, 
          status: "no_match",
          lastUpdated: new Date().toISOString()
        });
        return;
      }

      // Route to closest vendor
      const closestVendor = vendors[0];
      console.log(`✅ Sample request ${snap.id} routed to vendor ${closestVendor.uid} (${closestVendor.distance.toFixed(1)} miles away)`);

      await snap.ref.update({ 
        matchedVendorId: closestVendor.uid,
        matchedVendorDistance: closestVendor.distance,
        status: "matched",
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ Error routing sample request ${snap.id}:`, error);
      await snap.ref.update({ 
        status: "error_routing",
        errorMessage: error.message,
        lastUpdated: new Date().toISOString()
      });
    }
  });

// 🔄 Helper function to add geohash to existing users
exports.addGeohashToUsers = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const usersSnapshot = await db.collection("users").get();
    const batch = db.batch();
    let updatedCount = 0;

    for (const doc of usersSnapshot.docs) {
      const user = doc.data();
      if (user.latitude && user.longitude && !user.geohash) {
        const geohash = geofire.geohashForLocation([user.latitude, user.longitude]);
        batch.update(doc.ref, { geohash });
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ Added geohash to ${updatedCount} users`);
    }

    res.json({ 
      success: true, 
      message: `Added geohash to ${updatedCount} users`,
      updatedCount 
    });

  } catch (error) {
    console.error('❌ Error adding geohash to users:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🔄 Manual lead matching endpoint for testing
exports.manualMatchLead = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { leadId } = req.body;
  if (!leadId) {
    return res.status(400).json({ error: 'Lead ID is required' });
  }

  try {
    const leadDoc = await db.collection("leads").doc(leadId).get();
    if (!leadDoc.exists) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = leadDoc.data();
    const { zipCode, materialCategory } = lead;

    const origin = zipDb[zipCode];
    if (!origin) {
      return res.status(400).json({ error: `No coordinates found for ZIP: ${zipCode}` });
    }

    const matchedVendors = await matchUsersByGeo("vendor", origin, "productCategories", materialCategory);
    const matchedTrades = await matchUsersByGeo("trade", origin, "tradeCategories", materialCategory);

    await leadDoc.ref.update({
      matchedVendors: matchedVendors.map(v => v.uid),
      matchedTrades: matchedTrades.map(t => t.uid),
      status: "matched",
      vendorDistances: matchedVendors,
      tradeDistances: matchedTrades,
      lastUpdated: new Date().toISOString()
    });

    res.json({ 
      success: true, 
      matchedVendors: matchedVendors.length,
      matchedTrades: matchedTrades.length,
      totalMatches: matchedVendors.length + matchedTrades.length
    });

  } catch (error) {
    console.error('❌ Error in manual lead matching:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  matchUsersByGeo,
  zipDb
};