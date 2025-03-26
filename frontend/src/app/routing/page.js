"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '../context/AuthContext';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthWrapper from "../components/auth/authWrapper";

export default function RoutingPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [displayDate, setDisplayDate] = useState("");
    const [data, setData] = useState([]);
    const [expandedCompanies, setExpandedCompanies] = useState(new Set());
    const [scannedOutletId, setScannedOutletId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [updatedData, setUpdatedData] = useState({});

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    useEffect(() => {
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setDisplayDate(formattedDate);
        }
    }, [selectedDate]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (date) {
            const formattedDate = date.toISOString().split('T')[0];
            setDisplayDate(formattedDate);
        } else {
            setDisplayDate("");
        }
    };

    const fetchData = async () => {
        if (!isAuthenticated) return;
        if (!selectedDate) {
            setError("Please select a date.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const formattedDate = selectedDate.toISOString().split('T')[0];
            let url = `${BASE_URL}/api/routing/get-data/?date=${formattedDate}`;
            if (!user.is_staff) {
                url += `&user=${user.username}`;
            }

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load data.");
            }

            const result = await response.json();

            if (result.length === 0) {
                toast.info("No data found for the selected date.");
            } else {
                toast.success("Routes loaded successfully.");
            }

            setData(result);

            const initialUpdatedData = result.reduce((acc, item) => {
                acc[item.id] = {
                    pos_serial_number: item.pos_serial_number || "",
                };
                return acc;
            }, {});

            setUpdatedData(initialUpdatedData);
        } catch (err) {
            toast.error("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleCompany = (companyName) => {
        setExpandedCompanies(prev => {
            const newSet = new Set(prev);
            if (newSet.has(companyName)) {
                newSet.delete(companyName);
            } else {
                newSet.add(companyName);
            }
            return newSet;
        });
    };

    const handleQRScan = (id, companyName) => {
        const updatedState = {
            selectedDate,
            displayDate,
            data,
            updatedData: {
                ...updatedData,
                [id]: {
                    ...updatedData[id],
                    pos_serial_number: updatedData[id]?.pos_serial_number || ""
                }
            },
            companyToExpand: companyName
        };

        localStorage.setItem("routingState", JSON.stringify(updatedState));
        router.push(`/qr-scanner?redirectTo=/routing&id=${id}`);
    };

    const handleInputChange = (id, field, value) => {
        setUpdatedData((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
        if (!isAuthenticated) return;
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/routing/update-data/`, {
                method: "PATCH",
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error("Failed to save data.");
            }

            toast.success("Saved successfully.");
        } catch (err) {
            toast.error("Failed to save data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedState = localStorage.getItem('routingState');
        const scanResult = localStorage.getItem('qrScanResult');

        if (savedState) {
            const { selectedDate, displayDate, data, updatedData, companyToExpand } = JSON.parse(savedState);
            setSelectedDate(selectedDate ? new Date(selectedDate) : null);
            setDisplayDate(displayDate);
            setData(data);
            setUpdatedData(updatedData);

            if (companyToExpand) {
                setExpandedCompanies(prev => new Set(prev).add(companyToExpand));
            }

            localStorage.removeItem('routingState');
        }

        if (scanResult) {
            const { id, pos_serial_number } = JSON.parse(scanResult);

            if (id) {
                setScannedOutletId(id);
                setUpdatedData((prev) => ({
                    ...prev,
                    [id]: {
                        ...prev[id],
                        pos_serial_number,
                    },
                }));
            }

            localStorage.removeItem('qrScanResult');
        }
    }, []);

    useEffect(() => {
        if (scannedOutletId && data.length > 0) {
            const outlet = data.find(item => item.id === scannedOutletId);
            if (outlet) {
                setTimeout(() => {
                    const element = document.getElementById(`outlet-${scannedOutletId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }, 100);
            }
        }
    }, [scannedOutletId, data]);

    const groupedData = data.reduce((acc, item) => {
        const key = item.company_name;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});

    return (
        <AuthWrapper>
            <div className="container">
                <h1>Routing</h1>
                {error && <p className="error-message">{error}</p>}

                <div className="date-picker-container">
                    <label htmlFor="date">Select date: </label>
                    <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        inline
                        dateFormat="dd/MM/yyyy"
                        className="date-picker-input"
                        placeholderText="Select a date"
                    />

                    <div className="buttons">
                        <button className="load-data-btn"
                            onClick={fetchData}
                            disabled={loading}
                        >
                            {loading ? <div className="spinner"></div> : "Load Data"}
                        </button>
                        <button className="btn"
                            onClick={handleSave}
                            disabled={loading || data.length === 0}
                        >
                            {loading ? <div className="spinner"></div> : "Save Data"}
                        </button>
                    </div>
                </div>

                <div className="loaded-outlets">
                    {Object.entries(groupedData).map(([companyName, outlets]) => (
                        <div className="outlet" key={companyName}>
                            <h5
                                onClick={() => toggleCompany(companyName)}
                                style={{
                                    cursor: "pointer",
                                    color: expandedCompanies.has(companyName) ? "#0070f3" : "#fff",
                                }}
                            >
                                {companyName} &rArr; {outlets.length}
                            </h5>

                            {expandedCompanies.has(companyName) && (
                                <div className="company-outlets-wrapper">
                                    {outlets.map((outlet) => (
                                        <div
                                            id={`outlet-${outlet.id}`}
                                            className="outlet-details"
                                            key={outlet.id}
                                            style={{
                                                border: `3px solid ${outlet.type_of_route === 'install' ? 'green' : 'red'}`,
                                            }}
                                        >
                                            <p className="outlet-sub-details-data">
                                                <span>Outlet name:</span>
                                                <span>{outlet.outlet_name}</span>
                                            </p>
                                            <div className="outlet-sub-details">
                                                <p className="outlet-sub-details-data">
                                                    <span>Delivery Address:</span>
                                                    <span>{outlet.delivery_address}</span>
                                                </p>
                                                <p className="outlet-sub-details-data">
                                                    <span>POS Serial Number: </span>
                                                    <input
                                                        style={{ color: "black" }}
                                                        type="text"
                                                        value={
                                                            updatedData[outlet.id]?.pos_serial_number || ""
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                outlet.id,
                                                                "pos_serial_number",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </p>
                                            </div>
                                            <p className="outlet-sub-details-data">
                                                <span>Comment: </span>
                                                <span>{outlet.comment}</span>
                                            </p>
                                            {outlet.type_of_route === 'install' && (
                                                <button className="scan-btn"
                                                    onClick={() => handleQRScan(outlet.id, outlet.company_name)}
                                                >
                                                    Scan QR Code
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </AuthWrapper>
    );
}