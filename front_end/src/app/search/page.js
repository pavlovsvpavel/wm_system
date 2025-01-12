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
            toast.info("You are not authenticated. Please log in.");
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            if (!latestFile) {
                const fetchLatestFile = async () => {
                    try {
                        const token = localStorage.getItem("token");
                        const response = await fetch(`${BASE_URL}/api/files/latest-file/`, {
                            method: "GET",
                            headers: {
                                Authorization: `Token ${token}`,
                            },
                        });

                        if (response.status === 200) {
                            const data = await response.json();
                            // Save the latest file id in sessionStorage
                            sessionStorage.setItem("latest_file_id", data.latest_file_id);
                            sessionStorage.setItem("latest_file_name", data.latest_file_name);
                            setLatestFile(data);
                            toast.success("Database loaded successfully.");

                        } else if (response.status === 204) {
                            toast.info("No database found. Please upload a database first.");
                            setLatestFile(null);

                        } else {
                            toast.error("Failed to fetch the latest database.");
                        }
                    } catch (error) {
                        console.error("Error fetching latest file:", error);
                        toast.error("Failed to fetch latest database.");
                    }
                };

                fetchLatestFile();
            }
        }
    }, [BASE_URL, isAuthenticated]);

    const handleSearch = useCallback(
        async (query = searchQuery) => {
            const latestFile = sessionStorage.getItem('latest_file_id');

            if (!query) {
                toast.error("Please enter a serial number.");
                return;
            }

            if (!latestFile) {
                toast.info("No database found. Please upload database first.");
                return;
            }

            if (!isAuthenticated) {
                toast.error("You are not authenticated. Please log in.");
                return;
            }

            try {
                const token = localStorage.getItem("token");
                const response = await fetch(
                    `${BASE_URL}/api/db/search/?scanned_pos_serial_number=${query}&latest_file_id=${latestFile}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Token ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (data.pos_serial_number) {
                    setSearchResults(data);
                    setCondition(data.scanned_technical_condition);
                    setScanWarehouse(data.scanned_outlet_whs_name);

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

                    toast.info('No match found. Click "Save" to add in the database.');
                }

            } catch (error) {
                toast.error("Failed to perform search. Please try again.");
            }
        },
        [searchQuery, isAuthenticated]
    );

    const handleSave = async () => {
        const latestFile = sessionStorage.getItem('latest_file_id');

        if (!latestFile) {
            toast.error("No database found. Please upload database first.");
            return;
        }

        const payload = {
            latest_file_id: latestFile,
            pos_serial_number: searchResults.pos_serial_number,
            scanned_technical_condition: condition,
            scanned_outlet_whs_name: scanWarehouse,
        };

        if (isAuthenticated) {
            try {
                const token = localStorage.getItem("token");

                if (!searchResults.pos_serial_number || !condition || !scanWarehouse) {
                    toast.error("Please fill condition and scanned warehouse fields.");
                    return;
                }

                const response = await fetch(`${BASE_URL}/api/db/update/`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    const data = await response.json();
                    toast.success(data.message);

                    // Reset form fields after save
                    setSearchQuery("");
                    setSearchResults(null);
                    setCondition("");
                    setScanWarehouse("");
                } else {
                    // Handle non-200 responses
                    const errorData = await response.json();
                    toast.error(errorData.message || "Failed to save changes. Please try again.");
                }

            } catch (error) {
                console.error("Save error:", error);
                toast.error("Failed to save changes. Please try again.");
            }
        }
    };

    // Handle QR code value from query parameters
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const qrCodeValue = queryParams.get("qr");

        if (qrCodeValue) {
            setSearchQuery(qrCodeValue);
        }

    }, [latestFile]);

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
                {latestFile && latestFile.latest_file_name ? (
                    <p>
                        Last uploaded database:{" "}
                        <strong>{latestFile.latest_file_name}</strong>
                    </p>
                ) : (
                    <p>No database found. Please upload a database first.</p>
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
