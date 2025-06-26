import React, { useState, useEffect, useContext, createContext } from 'react';
import firebaseService from '@/services/firebase-network';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (email, password) => {
        const { user: authUser } = await firebaseService.signInWithEmail(email, password);
        if (authUser.isAdmin) { setUser(authUser); } 
        else { const profile = await firebaseService.getMemberProfile(authUser.uid); setUser(profile); }
    };
    
    const register = (data) => firebaseService.registerWithEmail(data);
    const logout = () => setUser(null);

    useEffect(() => { setTimeout(() => setLoading(false), 500); }, []);

    const value = { user, login, logout, register, loading, setUser };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);