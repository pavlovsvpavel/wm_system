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
    const [selectedConditions, setselectedConditions] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState("");
    const [warehouses, setWarehouses] = useState([]);
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const { latestFile, setLatestFile } = useFile();

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            toast.info("You are not authenticated. Please log in.");
        }
    }, [isAuthenticated, isLoading]);

    useEffect(() => {
        if (isAuthenticated) {
            const token = localStorage.getItem("token");

            // Fetch technical conditions with token in headers
            fetch(`${BASE_URL}/api/accounts/user/technical-conditions/`, {
                headers: {
                    "Authorization": `Token ${token}`,
                },
            })
                .then(response => {
                    // Handle unauthorized responses
                    if (response.status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        router.push('/login');
                        toast.error("Your session has expired. Please log in again.");
                        return;
                    }
                    return response.json();
                })
                .then(data => {
                    setConditions(Array.isArray(data) ? data : []);
                })
                .catch((error) => {
                    console.error("Error fetching conditions:", error);
                    setConditions([]);
                });

            // Fetch warehouse names with token in headers
            fetch(`${BASE_URL}/api/accounts/user/whs-names/`, {
                headers: {
                    "Authorization": `Token ${token}`,
                },
            })
                .then(response => {
                    // Handle unauthorized responses
                    if (response.status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        router.push('/login');
                        toast.error("Your session has expired. Please log in again.");
                        return;
                    }
                    return response.json();
                })
                .then(data => {
                    setWarehouses(Array.isArray(data) ? data : []);
                })
                .catch((error) => {
                    console.error("Error fetching warehouse data:", error);
                    setWarehouses([]);
                });
        }
    }, [isAuthenticated, BASE_URL, router]);

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
                toast.error("Please enter a serial number or scan a QR Code.");
                return;
            }

            if (!latestFile) {
                toast.info("No database found. Please upload database first.");
                return;
            }

            if (!isAuthenticated) {
                toast.info("You are not authenticated. Please log in.");
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
                    setselectedConditions([]);
                    setSelectedWarehouse(data.scanned_outlet_whs_name || "");

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

                    setselectedConditions([]);
                    setSelectedWarehouse("");

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
            scanned_technical_condition: selectedConditions.join(', '),
            scanned_outlet_whs_name: selectedWarehouse,
        };

        if (isAuthenticated) {
            try {
                const token = localStorage.getItem("token");

                if (!searchResults.pos_serial_number || selectedConditions.length === 0 || !selectedWarehouse) {
                    toast.error("Please fill both condition and scanned warehouse fields.");
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
                    setselectedConditions([]);
                    setSelectedWarehouse("");
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

    const handleConditionChange = (condition) => {
        setselectedConditions((prev) =>
            prev.includes(condition)
                ? prev.filter((item) => item !== condition)
                : [...prev, condition]
        );
    };

    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => setIsOpen((prev) => !prev);

    const handleOutsideClick = (e) => {
        if (e.target.closest('.dropdown') === null) {
            setIsOpen(false);
        }
    };

    // Listen for clicks outside the dropdown to close it
    useEffect(() => {
        document.addEventListener('click', handleOutsideClick);
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, []);

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
                <button className="btn" onClick={() => handleSearch()}>Search</button>
                <button className="btn" onClick={() => router.push("/qr-scanner")}>
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
                            <p>Technical conditions:</p>
                            <p>{searchResults.scanned_technical_condition}</p>
                        </li>
                        <li>
                            <p>Scanned WHS name:</p>
                            <p>{searchResults.scanned_outlet_whs_name}</p>
                        </li>
                    </ul>
                </div>
            )}

            {searchResults && (
                <div className="selection-fields">
                    <div className="conditions-dropdown">
                        <div className="dropdown" onClick={toggleDropdown}>
                            <button className="dropdown-btn">
                                {selectedConditions.length ? selectedConditions.join(', ') : "Select Conditions"}
                            </button>
                            {isOpen && (
                                <ul className="dropdown-content" onClick={(e) => e.stopPropagation()}>
                                    {conditions.map((condition, index) => (
                                        <li 
                                        key={index} 
                                        className={`dropdown-item ${selectedConditions.includes(condition.technical_condition) ? 'selected' : ''}`}
                                        onClick={() => handleConditionChange(condition.technical_condition)}
                                        >
                                            <input
                                                type="checkbox"
                                                value={condition.technical_condition}
                                                checked={selectedConditions.includes(condition.technical_condition)}
                                                onChange={() => handleConditionChange(condition.technical_condition)}

                                                className="hidden-checkbox"
                                            />
                                            <p>{condition.technical_condition}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <select className="warehouse-dropdown"
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                    >
                        <option value="">Select Warehouse</option>
                        {Array.isArray(warehouses) && warehouses.map((warehouse, index) => (
                            <option key={index} value={warehouse.whs_name}>
                                {warehouse.whs_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {searchResults && (
                <div className="save-button">
                    <button className="btn" onClick={handleSave}>Save</button>
                </div>
            )}
        </div>
    );
}
