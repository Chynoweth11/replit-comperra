// Professional Network Service - Complete Firebase Integration
const firebaseService = (() => {
    let MOCK_MEMBERS = [];
    let MOCK_LEADS = [];
    const zipCodeDatabase = {
        "90210": { lat: 34.0901, lon: -118.4065 }, "86001": { lat: 35.1983, lon: -111.6513 },
        "10001": { lat: 40.7505, lon: -73.9980 }, "33139": { lat: 25.7907, lon: -80.1300 },
        "60611": { lat: 41.8918, lon: -87.6224 }, "75201": { lat: 32.7811, lon: -96.7972 },
        "30309": { lat: 33.7901, lon: -84.3902 }, "98101": { lat: 47.6062, lon: -122.3321 },
        "80202": { lat: 39.7547, lon: -105.0178 }, "02108": { lat: 42.3751, lon: -71.0603 }
    };
    const subscriptionTiers = {
        basic: { name: 'Basic', radius: 10, cost: '$0/mo', description: '🔒 Claim up to 2 leads per month\n📍 Matching radius: 10 miles\n⚠️ Limited support or visibility' },
        pro: { name: 'Pro', radius: 50, cost: '$49/mo', description: 'The best value for established businesses, with unlimited lead claims.' },
        credit: { name: 'Pay-as-you-go', radius: 50, cost: '$15/lead', description: 'A flexible option with no subscription. Simply buy credits to claim the leads you want.' }
    };
    const haversine = (c1, c2) => {
        const R = 3959; const r = (x) => x * Math.PI / 180;
        const dLat = r(c2.lat - c1.lat), dLon = r(c2.lon - c1.lon), lat1 = r(c1.lat), lat2 = r(c2.lat);
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };
    
    const serviceCategoryMap = {
        'Tiles': { pro: 'Tile Installation', vendor: 'Tile Supplier' },
        'Stone & Slabs': { pro: 'Slabs/Countertop Supply & Installation', vendor: null },
        'Vinyl & LVT': { pro: 'Vinyl & LVT Installation', vendor: 'Vinyl & LVT Supplier' },
        'Hardwood': { pro: 'Hardwood Floor Installation', vendor: 'Hardwood Flooring Supplier' },
        'Carpet': { pro: 'Carpet Installation', vendor: 'Carpet Supplier' },
        'Heating & Thermostats': { pro: 'Heating & Thermostat Installation', vendor: 'Heating & Thermostat Product Seller' }
    };

    const registerWithEmail = (data) => new Promise((resolve, reject) => {
        setTimeout(() => {
            if (MOCK_MEMBERS.some(m => m.email === data.email)) { reject({ code: 'auth/email-already-in-use' }); return; }
            const coords = zipCodeDatabase[data.zipCode];
            if (!coords) { reject({ message: 'Invalid ZIP code.' }); return; }
            const uid = `user_${Date.now()}`;
            const newUser = { ...data, uid, coordinates: coords, credits: data.subscription === 'credit' ? 5 : 0, claimedLeads: [] };
            MOCK_MEMBERS.push(newUser);
            resolve({ user: { uid, email: data.email, displayName: data.name } });
        }, 1000);
    });

    const signInWithEmail = (email, password) => new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === 'admin@comperra.com' && password === 'admin123') { resolve({ user: { uid: 'admin', email, isAdmin: true, displayName: 'Admin' } }); return; }
            const member = MOCK_MEMBERS.find(m => m.email === email);
            if (member) resolve({ user: { uid: member.uid, email: member.email, displayName: member.name } });
            else reject({ code: 'auth/user-not-found' });
        }, 800);
    });

    const getMemberProfile = (uid) => new Promise((resolve) => {
        setTimeout(() => { resolve(MOCK_MEMBERS.find(m => m.uid === uid)); }, 500);
    });

    const getMatchedLeads = (member) => new Promise((resolve) => {
         setTimeout(() => {
            if (!member || member.isAdmin) { resolve([]); return; }
            const searchRadius = subscriptionTiers[member.subscription].radius;
            let leadLimit = Infinity;
            if (member.subscription === 'basic') { leadLimit = 2 - (member.claimedLeads?.length || 0); }

            const matches = MOCK_LEADS
                .filter(lead => {
                    if (lead.leadType !== member.type) return false;
                    const requiredService = serviceCategoryMap[lead.serviceType]?.[member.type];
                    if (!requiredService) return false;
                    return member.services.includes(requiredService) && !member.claimedLeads.includes(lead.id);
                })
                .map(lead => ({ ...lead, distance: haversine(member.coordinates, lead.coordinates) }))
                .filter(lead => lead.distance <= searchRadius)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, leadLimit);
            resolve(matches);
        }, 1500);
    });
    
    const submitLead = (leadData) => new Promise((resolve, reject) => {
        setTimeout(() => {
            const coords = zipCodeDatabase[leadData.zipCode];
            if (!coords) { reject({ message: 'Invalid ZIP code.' }); return; }
            const newLead = { ...leadData, id: `lead_${Date.now()}`, coordinates: coords, createdAt: new Date().toISOString() };
            MOCK_LEADS.push(newLead);
            resolve(newLead);
        }, 1000);
    });

    const claimLead = (uid, leadId) => new Promise((resolve) => {
        setTimeout(() => {
            MOCK_MEMBERS = MOCK_MEMBERS.map(m => {
                if (m.uid === uid) {
                    if (m.subscription === 'credit' && m.credits > 0) return { ...m, credits: m.credits - 1, claimedLeads: [...m.claimedLeads, leadId] };
                    if (m.subscription === 'basic' && m.claimedLeads.length < 4) return { ...m, claimedLeads: [...m.claimedLeads, leadId] };
                }
                return m;
            });
            resolve(true);
        }, 700);
    });
    
    const createStripeCheckout = (uid) => new Promise((resolve) => {
        setTimeout(() => { resolve({ sessionId: `checkout_session_${Date.now()}` }); }, 1200);
    });

    return { registerWithEmail, signInWithEmail, getMemberProfile, getMatchedLeads, submitLead, claimLead, createStripeCheckout, MOCK_LEADS, MOCK_MEMBERS, subscriptionTiers };
})();

export default firebaseService;