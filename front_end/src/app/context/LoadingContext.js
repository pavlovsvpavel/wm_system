import React, { createContext, useContext, useState } from 'react';
import '../../styles/globals.css'; // Adjust the path if needed

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

const LoadingSpinner = () => (
    <div className="loading-spinner">
        <p>Loading</p>
        <div className="spinner"></div>
    </div>
);

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            <>
                {loading && <LoadingSpinner />}
                {children}
            </>
        </LoadingContext.Provider>
    );
};

