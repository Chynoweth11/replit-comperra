// Professional Network Service - Complete Firebase Integration
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const firebaseService = (() => {
    const zipCodeDatabase: Record<string, { lat: number; lon: number }> = {
        "90210": { lat: 34.0901, lon: -118.4065 }, "86001": { lat: 35.1983, lon: -111.6513 },
        "10001": { lat: 40.7505, lon: -73.9980 }, "33139": { lat: 25.7907, lon: -80.1300 },
        "60611": { lat: 41.8918, lon: -87.6224 }, "75201": { lat: 32.7811, lon: -96.7972 },
        "30309": { lat: 33.7901, lon: -84.3902 }, "98101": { lat: 47.6062, lon: -122.3321 },
        "80202": { lat: 39.7547, lon: -105.0178 }, "02108": { lat: 42.3751, lon: -71.0603 }
    };

    const subscriptionTiers = {
        basic: { name: 'Basic Plan', radius: 10, cost: '$0/mo', description: '🔒 Claim up to 2 leads per month\n📍 Matching radius: 10 miles\n⚠️ Limited support or visibility' },
        pro: { name: 'Pro Plan', radius: 50, cost: '$49/mo', description: 'The best value for established businesses, with unlimited lead claims.' },
        credit: { name: 'Pay-as-you-go', radius: 50, cost: '$15/lead', description: 'A flexible option with no subscription. Simply buy credits to claim the leads you want.' }
    };

    interface RegistrationData {
        name: string;
        email: string;
        password: string;
        zipCode: string;
        type: string;
        subscription: string;
        services: string[];
    }

    const registerWithEmail = async (data: RegistrationData) => {
        try {
            // Validate ZIP code
            const coords = zipCodeDatabase[data.zipCode];
            if (!coords) { 
                throw { message: 'Invalid ZIP code.' }; 
            }

            // Create Firebase Auth user
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            // Create professional profile in Firestore
            const profileData = {
                name: data.name,
                email: data.email,
                zipCode: data.zipCode,
                type: data.type,
                subscription: data.subscription,
                services: data.services,
                coordinates: coords,
                credits: data.subscription === 'credit' ? 5 : 0,
                claimedLeads: [],
                createdAt: new Date(),
                isActive: true
            };

            await setDoc(doc(db, 'comperra-professionals', user.uid), profileData);

            return { user: { uid: user.uid, email: user.email, displayName: data.name } };
        } catch (error) {
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            // Admin login check
            if (email === 'admin@comperra.com' && password === 'admin123') {
                return { user: { uid: 'admin', email, isAdmin: true, displayName: 'Admin' } };
            }

            // Firebase Auth sign in
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get professional profile from Firestore
            const profileDoc = await getDoc(doc(db, 'comperra-professionals', user.uid));
            if (profileDoc.exists()) {
                const profileData = profileDoc.data();
                return { 
                    user: { 
                        uid: user.uid, 
                        email: user.email, 
                        displayName: profileData.name 
                    } 
                };
            } else {
                throw { code: 'auth/user-not-found' };
            }
        } catch (error) {
            throw error;
        }
    };

    const getMemberProfile = async (uid: string) => {
        try {
            const profileDoc = await getDoc(doc(db, 'comperra-professionals', uid));
            if (profileDoc.exists()) {
                return { uid, ...profileDoc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting member profile:', error);
            return null;
        }
    };

    // Mock functions for leads functionality (can be implemented later)
    const getMatchedLeads = async (member: any) => {
        // Return empty array for now - leads functionality can be implemented later
        return [];
    };

    const submitLead = async (leadData: any) => {
        try {
            const coords = zipCodeDatabase[leadData.zipCode];
            if (!coords) {
                throw { message: 'Invalid ZIP code.' };
            }
            
            const newLead = {
                ...leadData,
                coordinates: coords,
                createdAt: new Date()
            };
            
            await addDoc(collection(db, 'comperra-leads'), newLead);
            return newLead;
        } catch (error) {
            throw error;
        }
    };

    const claimLead = async (uid: string, leadId: string) => {
        // Mock implementation - returns success
        return true;
    };

    const createStripeCheckout = async (uid: string) => {
        // Mock implementation
        return { sessionId: `checkout_session_${Date.now()}` };
    };

    return {
        subscriptionTiers,
        register: registerWithEmail,
        signIn: signInWithEmail,
        getMemberProfile,
        getMatchedLeads,
        submitLead,
        claimLead,
        createStripeCheckout
    };
})();

export default firebaseService;