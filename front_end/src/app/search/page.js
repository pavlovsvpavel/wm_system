"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from '../context/AuthContext';
import { useFile } from "../context/FileContext";

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [condition, setCondition] = useState("");
    const [scanWarehouse, setScanWarehouse] = useState("");
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const { latestFile, setLatestFile } = useFile();

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            toast.error("You are not authenticated. Please log in.");
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            if (!latestFile) {
                const fetchLatestFile = async () => {
                    try {
                        const token = localStorage.getItem("token");
                        const response = await fetch(`${BASE_URL}/api/upload/latest-file/`, {
                            method: "GET",
                            headers: {
                                Authorization: `Token ${token}`,
                            },
                        });

                        if (response.status === 200) {
                            const data = await response.json();
                            setLatestFile(data);
                            toast.success("Database loaded successfully.");
                        } else {
                            toast.error("Failed to fetch latest database.");
                        }
                    } catch (error) {
                        console.error("Error fetching latest file:", error);
                        toast.error("Failed to fetch latest database.");
                    }
                };

                fetchLatestFile();
            }
        }
    }, [latestFile, setLatestFile, BASE_URL]);


    // Handle QR code value from query parameters
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const qrCodeValue = queryParams.get("qr");

        if (qrCodeValue) {
            setSearchQuery(qrCodeValue);
        }

    }, [latestFile]);

    const handleSearch = useCallback(
        async (query = searchQuery) => {
            if (!query) {
                toast.error("Please enter a serial number.");
                return;
            }

            if (!latestFile) {
                toast.error("No database found. Please upload database first.");
                return;
            }

            try {
                const row = latestFile.rows.find(
                    (row) => row.pos_serial_number === query
                );

                if (row) {
                    setSearchResults(row);
                    setCondition(row.scanned_technical_condition);
                    setScanWarehouse(row.scanned_outlet_whs_name);
                    toast.success("Match found!");
                } else {
                    setSearchResults({
                        pos_serial_number: query,
                        outlet_whs_name: "",
                        outlet_whs_address: "",
                        pos_type: "",
                        scanned_technical_condition: "",
                        scanned_outlet_whs_name: "",
                    });
                    setCondition("");
                    setScanWarehouse("");
                    toast.info(
                        'No match found. Click "Save" to add in database.'
                    );
                }
            } catch (error) {
                toast.error("Failed to perform search. Please try again.");
            }
        },
        [latestFile, searchQuery]
    );

    const handleSave = async () => {
        if (!searchResults) {
            toast.error("No data to save.");
            return;
        }
    
        if (isAuthenticated) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${BASE_URL}/api/search/`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({
                        qr_code: searchResults.pos_serial_number,
                        file_id: latestFile.id,
                        condition_data: condition,
                        scan_warehouse_data: scanWarehouse,
                    }),
                });
    
                if (response.status === 200) {
                    const data = await response.json();
                    toast.success(data.message);
    
                    // Reset form fields after save
                    setSearchQuery("");
                    setSearchResults(null);
                    setCondition("");
                    setScanWarehouse("");
    
                    // Fetch the latest file again after saving
                    const fetchLatestFile = async () => {
                        try {
                            const response = await fetch(`${BASE_URL}/api/upload/latest-file/`, {
                                method: "GET",
                                headers: {
                                    Authorization: `Token ${token}`,
                                },
                            });
    
                            if (response.status === 200) {
                                const data = await response.json();
                                setLatestFile(data);
                                toast.success("Database reloaded successfully.");
                            }
                        } catch (error) {
                            toast.error("Failed to fetch latest database.");
                        }
                    };
    
                    fetchLatestFile();
                }
            } catch (error) {
                console.error("Save error:", error);
                toast.error("Failed to save changes. Please try again.");
            }
        }
    };    

    // Show loading spinner while authentication state is being initialized
    if (isLoading) {
        return (
            <div className="loading-spinner">
                <p>Loading</p>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1>Assets search</h1>
            <div className="latest-file">
                {latestFile && (
                    <p>
                        Last uploaded database:{" "}
                        <strong>{latestFile.name}</strong>
                    </p>
                )}
            </div>

            <div className="search-input">
                <input
                    type="text"
                    placeholder="Enter serial number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={() => handleSearch()}>Search</button>
                <button onClick={() => router.push("/qr-scanner")}>
                    Scan QR Code
                </button>
            </div>

            {searchResults && (
                <div className="search-results">
                    <ul>
                        <li>
                            <p>Serial Number:</p>
                            <p>{searchResults.pos_serial_number}</p>
                        </li>
                        <li>
                            <p>POS Type:</p>
                            <p>{searchResults.pos_type}</p>
                        </li>
                        <li>
                            <p>Outlet/WHS name:</p>
                            <p>{searchResults.outlet_whs_name}</p>
                        </li>
                        <li>
                            <p>Outlet/WHS address:</p>
                            <p>{searchResults.outlet_whs_address}</p>
                        </li>
                        <li>
                            <p>Condition:</p>
                            <p>{searchResults.scanned_technical_condition}</p>
                        </li>
                        <li>
                            <p>Scanned warehouse:</p>
                            <p>{searchResults.scanned_outlet_whs_name}</p>
                        </li>
                    </ul>
                </div>
            )}

            {searchResults && (
                <div className="selection-fields">
                    <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                    >
                        <option value="">Select Condition</option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                    </select>

                    <select
                        value={scanWarehouse}
                        onChange={(e) => setScanWarehouse(e.target.value)}
                    >
                        <option value="">Select Warehouse</option>
                        <option value="warehouse1">Warehouse 1</option>
                        <option value="warehouse2">Warehouse 2</option>
                    </select>
                </div>
            )}

            {searchResults && (
                <div className="save-button">
                    <button onClick={handleSave}>Save</button>
                </div>
            )}
        </div>
    );
}
