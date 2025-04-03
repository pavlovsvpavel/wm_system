"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from '../context/AuthContext';
import { useFile } from "../context/FileContext";
import { CButton, CModal, CModalHeader, CModalTitle, CModalBody, CFormCheck } from '@coreui/react'
import useConditionsAndWarehousesData from '../hooks/useConditionsAndWarehousesData';
import AuthWrapper from "../components/auth/authWrapper";

export default function SearchPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [selectedConditions, setSelectedConditions] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState("");
    const { isAuthenticated } = useAuth();
    const { latestFile, setLatestFile } = useFile();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [matches, setMatches] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const lastSelectedMatch = useRef(null);

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    const { conditions, warehouses } = useConditionsAndWarehousesData(isAuthenticated, BASE_URL);

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!showDropdown || matches.length === 0) return;

            const items = dropdownRef.current?.querySelectorAll('.dropdown-item');
            if (!items || items.length === 0) return;

            const activeElement = document.activeElement;
            let currentIndex = Array.from(items).findIndex(item => item === activeElement);

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                items[nextIndex].focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                items[prevIndex].focus();
            } else if (e.key === 'Enter' && currentIndex >= 0) {
                e.preventDefault();
                handleSelectMatch(matches[currentIndex]);
            } else if (e.key === 'Escape') {
                setShowDropdown(false);
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showDropdown, matches]);

    // Fetch latest file
    useEffect(() => {
        if (!isAuthenticated || latestFile) return;

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
                toast.error("Failed to fetch latest database.");
            }
        };

        fetchLatestFile();
    }, [BASE_URL, isAuthenticated, latestFile, setLatestFile]);

    // Handle QR code from URL
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const qrCodeValue = queryParams.get("qr");

        if (qrCodeValue) {
            setSearchQuery(qrCodeValue);
            handleSearch(searchQuery);
        }
    }, [latestFile]);

    // Search function with debounce
    const handleSearch = useCallback(
        async (query = searchQuery, suppressToast = false) => {
            const latestFile = sessionStorage.getItem('latest_file_id');

            if (!query || query.length < 4) {
                setSearchResults(null);
                setMatches([]);
                setShowDropdown(false);
                return;
            }

            if (!latestFile) {
                toast.info("No database found. Please upload database first.");
                return;
            }

            setIsSearching(true);
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

                if (Array.isArray(data) && data.length > 0) {
                    setMatches(data);
                    setShowDropdown(true);

                    // Auto-select exact match
                    const exactMatch = data.find(item => item.pos_serial_number === query);
                    if (exactMatch) {
                        handleSelectMatch(exactMatch, true);
                        toast.success("Match found!");
                    } else if (!suppressToast) {
                        toast.success(`${data.length} matches found!`);
                    }
                } else {
                    setMatches([]);
                    setShowDropdown(false);
                    setSearchResults({
                        pos_serial_number: query,
                        outlet_whs_name: "",
                        outlet_whs_address: "",
                        pos_type: "",
                        scanned_technical_condition: "",
                        scanned_outlet_whs_name: "",
                    });
                    if (!suppressToast) {
                        toast.info("No match found!");
                    }
                }
            } catch (error) {
                if (!suppressToast) {
                    toast.error("Failed to perform search. Please try again.");
                }
            } finally {
                setIsSearching(false);
            }
        },
        [searchQuery, isAuthenticated]
    );

    // Debounced search effect
    useEffect(() => {
        // Skip API call if this update is from selecting a dropdown item
        if (lastSelectedMatch.current === searchQuery) {
            lastSelectedMatch.current = null;
            return;
        }

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            handleSearch(searchQuery);
        }, 500);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchQuery, handleSearch]);

    const handleSelectMatch = (match, suppressToast = false) => {
        // Store the match before state updates
        lastSelectedMatch.current = match.pos_serial_number;

        setSearchQuery(match.pos_serial_number);
        setSearchResults(match);
        setSelectedConditions([]);
        setSelectedWarehouse(match.scanned_outlet_whs_name || "");
        setMatches([]);
        setShowDropdown(false);

        if (match.pos_serial_number && !suppressToast) {
            // toast.success("Data loaded!");
        }
    };

    // Handle save
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

        try {
            const token = localStorage.getItem("token");

            if (!searchResults.pos_serial_number || selectedConditions.length === 0 || !selectedWarehouse) {
                toast.warning("Please fill both condition and scanned warehouse fields.");
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
                setSelectedConditions([]);
                setSelectedWarehouse("");
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Failed to save changes. Please try again.");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Failed to save changes. Please try again.");
        }
    };

    const handleConditionChange = (condition) => {
        const updatedConditions = selectedConditions.includes(condition)
            ? selectedConditions.filter((item) => item !== condition)
            : [...selectedConditions, condition];
        setSelectedConditions(updatedConditions);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleWarehouseChange = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setIsWarehouseModalOpen(false);
    };

    const openWarehouseModal = () => {
        setIsWarehouseModalOpen(true);
    };

    const closeWarehouseModal = () => {
        setIsWarehouseModalOpen(false);
    };

    return (
        <AuthWrapper>
            <div className="container-search-page">
                <h1>Inventory management</h1>
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

                <div className="search-input-container" style={{ position: 'relative' }}>
                    <div className="search-input" >
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Enter serial number"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => matches.length > 0 && setShowDropdown(true)}
                        />

                        <div className="search-input-buttons">
                            {/* <button className="btn" onClick={() => handleSearch()}>Search</button> */}
                            <button className="btn" onClick={() => router.push("/qr-scanner")}>
                                Scan QR Code
                            </button>
                        </div>

                    </div>
                    {isSearching && <div style={{ position: 'absolute', left: '10px', top: '100%' }}>Searching...</div>}

                    {showDropdown && matches.length > 0 && (
                        <div
                            ref={dropdownRef}
                            className="dropdown-menu"
                        >
                            {matches.map((match, index) => (
                                <button
                                    key={index}
                                    className="dropdown-item"
                                    onClick={() => handleSelectMatch(match)}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                >
                                    <div style={{ fontWeight: 'bold' }}>{match.pos_serial_number} - {match.pos_type}</div>
                                    {match.outlet_whs_name && (
                                        <div style={{ color: '#666', fontSize: '0.9em' }}>
                                            {match.outlet_whs_name}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {searchResults && (
                    <div className="selection-fields">
                        <div className="conditions-dropdown">
                            <CButton className="dropdown-menu-btn" onClick={openModal}>
                                {selectedConditions.length ? selectedConditions.join(', ') : 'Select Conditions'}
                            </CButton>

                            <CModal
                                visible={isModalOpen}
                                onClose={closeModal}
                                alignment="center"
                                backdrop={true}
                                className="custom-modal"
                            >
                                <CModalHeader>
                                    <CModalTitle>Select Conditions</CModalTitle>
                                </CModalHeader>
                                <CModalBody className="modal-body-scrollable">
                                    {conditions.length > 0 ? (conditions.map((condition, index) => (
                                        <div key={index} className="dropdown-item">
                                            <CFormCheck
                                                id={`condition-${index}`}
                                                label={condition.technical_condition}
                                                checked={selectedConditions.includes(condition.technical_condition)}
                                                onChange={() => handleConditionChange(condition.technical_condition)}
                                            />
                                        </div>
                                    ))
                                    ) : (
                                        <div className="dropdown-item">No saved conditions</div>
                                    )}
                                </CModalBody>
                            </CModal>
                        </div>

                        <div className="warehouse-dropdown">
                            <CButton className="dropdown-menu-btn" onClick={openWarehouseModal}>
                                {selectedWarehouse || 'Select Warehouse'}
                            </CButton>

                            <CModal
                                visible={isWarehouseModalOpen}
                                onClose={closeWarehouseModal}
                                alignment="center"
                                backdrop={true}
                                className="custom-modal"
                            >
                                <CModalHeader>
                                    <CModalTitle>Select Warehouse</CModalTitle>
                                </CModalHeader>
                                <CModalBody className="modal-body-scrollable">
                                    <div
                                        className="dropdown-item-warehouse"
                                        onClick={() => handleWarehouseChange('')}
                                    >
                                    </div>

                                    {Array.isArray(warehouses) && warehouses.length > 0 ?
                                        warehouses.map((warehouse, index) => (
                                            <div
                                                key={index}
                                                className="dropdown-item"
                                                onClick={() => handleWarehouseChange(warehouse.whs_name)}
                                            >
                                                {warehouse.whs_name}
                                            </div>
                                        ))
                                        : (
                                            <div className="dropdown-item">No saved warehouses</div>
                                        )}
                                </CModalBody>
                            </CModal>
                        </div>

                        <div className="save-button">
                            <button className="btn" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                )}

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
            </div>
        </AuthWrapper>
    );
}