"use client";

import { useState, useEffect, useCallback } from "react";
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
    const { isAuthenticated, isLoading, logout } = useAuth();
    const { latestFile, setLatestFile } = useFile();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    const { conditions, warehouses } = useConditionsAndWarehousesData(isAuthenticated, BASE_URL);

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
                console.error("Error fetching latest file:", error);
                toast.error("Failed to fetch latest database.");
            }
        };

        fetchLatestFile();

    }, [BASE_URL, isAuthenticated, latestFile, setLatestFile]);

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
                    setSelectedConditions([]);
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

                    setSelectedConditions([]);
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
                setSelectedConditions([]);
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
                                    {conditions.map((condition, index) => (
                                        <div key={index} className="dropdown-item">
                                            <CFormCheck
                                                id={`condition-${index}`}
                                                label={condition.technical_condition}
                                                checked={selectedConditions.includes(condition.technical_condition)}
                                                onChange={() => handleConditionChange(condition.technical_condition)}
                                            />
                                        </div>
                                    ))}
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
                                        className="dropdown-item"
                                        onClick={() => handleWarehouseChange('')}
                                    >
                                        {/* Select Warehouse */}
                                    </div>

                                    {Array.isArray(warehouses) &&
                                        warehouses.map((warehouse, index) => (
                                            <div
                                                key={index}
                                                className="dropdown-item"
                                                onClick={() => handleWarehouseChange(warehouse.whs_name)}
                                            >
                                                {warehouse.whs_name}
                                            </div>
                                        ))}
                                </CModalBody>
                            </CModal>
                        </div>

                        <div className="save-button">
                            <button className="btn" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                )}
            </div>
        </AuthWrapper>
    );
}
