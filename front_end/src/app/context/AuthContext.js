import { createContext, useContext } from 'react';
import { useAuthState } from './useAuthState'; // Import the custom hook

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const authState = useAuthState(); // Use the custom hook

    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}