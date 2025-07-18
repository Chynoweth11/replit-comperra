/**
 * Firebase Admin SDK Setup Script
 * Use this script to set custom claims for admin users
 * 
 * Prerequisites:
 * 1. Download your Firebase Admin SDK private key from:
 *    Firebase Console > Project Settings > Service Accounts > Generate New Private Key
 * 2. Save it as 'serviceAccountKey.json' in the project root
 * 3. Run: node admin-setup.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Note: You'll need to add your serviceAccountKey.json file
try {
  const serviceAccount = require('./serviceAccountKey.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://comperra-done-default-rtdb.firebaseio.com"
  });
  
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:');
  console.error('Please ensure you have downloaded your serviceAccountKey.json file');
  console.error('From: Firebase Console > Project Settings > Service Accounts');
  process.exit(1);
}

// Function to set admin claims for a user
async function setAdminClaims(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`✅ Admin claims set for user: ${uid}`);
  } catch (error) {
    console.error(`❌ Error setting admin claims for ${uid}:`, error);
  }
}

// Function to check user claims
async function checkUserClaims(uid) {
  try {
    const user = await admin.auth().getUser(uid);
    console.log(`User ${uid} custom claims:`, user.customClaims || 'None');
  } catch (error) {
    console.error(`❌ Error checking claims for ${uid}:`, error);
  }
}

// Main execution
async function main() {
  console.log('\n🔧 Firebase Admin Setup Script');
  console.log('================================');
  
  // Example usage - replace with actual UIDs from your Firebase Auth users
  const adminUIDs = [
    // Add your admin user UIDs here
    // Example: 'abc123def456ghi789jkl012'
  ];
  
  if (adminUIDs.length === 0) {
    console.log('\n⚠️  No admin UIDs specified.');
    console.log('To set admin claims:');
    console.log('1. Go to Firebase Console > Authentication > Users');
    console.log('2. Copy the UID of users you want to make admin');
    console.log('3. Add them to the adminUIDs array in this script');
    console.log('4. Run: node admin-setup.js');
    return;
  }
  
  // Set admin claims for specified users
  for (const uid of adminUIDs) {
    await setAdminClaims(uid);
    await checkUserClaims(uid);
  }
  
  console.log('\n✅ Admin setup complete!');
  console.log('Users will need to sign out and sign back in for claims to take effect.');
}

// Run the script
main().catch(console.error);