import { createContext, useContext } from 'react';
import { useAuthState } from '../hooks/useAuthState';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const authState = useAuthState();

    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}