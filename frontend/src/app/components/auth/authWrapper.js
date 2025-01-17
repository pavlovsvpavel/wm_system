import React from "react";
import { useAuth } from "../../context/AuthContext";

const AuthWrapper = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading spinner while authentication state is being initialized
    if (isLoading) {
        return (
            <div className="loading-spinner">
                <p>Loading</p>
                <div className="spinner"></div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    // Render the children if authenticated and not loading
    return <>{children}</>;
};

export default AuthWrapper;