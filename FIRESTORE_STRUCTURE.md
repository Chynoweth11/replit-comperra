# Comperra Firestore Structure

## Overview
This document outlines the recommended Firestore structure for Comperra, implementing scalable role-based access control with proper security rules.

## Collection Structure

### `/comperra-products/{productId}`
- **Purpose**: All building materials (tiles, slabs, LVT, hardwood, heating, carpet, thermostats)
- **Access**: Public read, admin write only
- **Schema**: Material objects with specifications, pricing, images, etc.

### `/leads/{leadId}`
- **Purpose**: All lead form submissions from customers
- **Access**: Public write (forms), admin read only
- **Schema**: Customer contact info, project details, material preferences

### `/vendors/{uid}`
- **Purpose**: Vendor profile data
- **Access**: UID-based (users can only access their own profile)
- **Key**: Firebase Authentication UID
- **Schema**: Company info, service areas, material specialties, subscription plans

### `/trades/{uid}`
- **Purpose**: Trade professional profile data
- **Access**: UID-based (users can only access their own profile)
- **Key**: Firebase Authentication UID
- **Schema**: Company info, service areas, trade specialties, certifications

### `/customers/{uid}`
- **Purpose**: Customer profile data
- **Access**: UID-based (users can only access their own profile)
- **Key**: Firebase Authentication UID
- **Schema**: Contact info, project history, preferences

### `/users/{uid}` (Optional)
- **Purpose**: Shared user information and role flags
- **Access**: UID-based (users can only access their own profile)
- **Key**: Firebase Authentication UID
- **Schema**: Basic user info, role, flags

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Products - public read, admin write
    match /comperra-products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Leads - public write for forms, admin read
    match /leads/{leadId} {
      allow write: if true;
      allow read: if request.auth != null && request.auth.token.admin == true;
    }

    // Role-based collections with UID matching
    match /vendors/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    match /trades/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    match /customers/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## Admin Setup

### Setting Custom Claims
To give users admin privileges, use the Firebase Admin SDK:

```javascript
const admin = require('firebase-admin');

// Set admin claim
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

### Checking Claims
From the frontend, after re-login:

```javascript
const idTokenResult = await firebase.auth().currentUser.getIdTokenResult();
console.log("Custom Claims:", idTokenResult.claims);
// Should show: { "admin": true }
```

## Implementation Benefits

1. **Scalable**: UID-based access scales with user growth
2. **Secure**: Users can only access their own data
3. **Efficient**: Direct UID matching in security rules
4. **Maintainable**: Clear separation of concerns
5. **Flexible**: Easy to add new role-based collections

## Migration Notes

- Current collections will continue to work for backward compatibility
- New collections should follow the UID-based pattern
- Admin claims must be set using Firebase Admin SDK
- Users need to sign out/in after claim updates

## Required Setup

1. Download Firebase Admin SDK private key
2. Save as `serviceAccountKey.json` in project root
3. Update `admin-setup.js` with admin user UIDs
4. Run: `node admin-setup.js`
5. Deploy updated Firestore rules

## Security Best Practices

- Never store admin credentials in client-side code
- Use Firebase Admin SDK for privileged operations
- Validate all data before writing to Firestore
- Monitor security rule usage in Firebase Console
- Regular audit of user roles and permissions