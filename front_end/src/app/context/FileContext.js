import React, { createContext, useContext, useState } from "react";

// Create the context
const FileContext = createContext();

// Custom hook for easy access
export const useFile = () => useContext(FileContext);

// Provider component
export const FileProvider = ({ children }) => {
    const [latestFile, setLatestFile] = useState(null);

    return (
        <FileContext.Provider value={{ latestFile, setLatestFile }}>
            {children}
        </FileContext.Provider>
    );
};
