
import React, { createContext, useContext } from 'react';
import { useAuthService } from '@/context/auth/useAuthService.jsx';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const authService = useAuthService();

    return (
        <AuthContext.Provider value={authService}>
            {children}
        </AuthContext.Provider>
    );
};
