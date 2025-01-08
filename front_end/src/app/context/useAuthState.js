import { useState, useEffect } from 'react';

export function useAuthState() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Add a loading state

    // Check for token on initial load
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsAuthenticated(true); // Set authentication state to true if token exists
        }
        setIsLoading(false); // Mark authentication state as initialized
    }, []);

    // Login function
    const login = (token) => {
        localStorage.setItem("token", token); // Store the token in localStorage
        setIsAuthenticated(true); // Set authentication state to true
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("token"); // Remove the token from localStorage
        setIsAuthenticated(false); // Set authentication state to false
    };

    return { isAuthenticated, isLoading, login, logout };
}