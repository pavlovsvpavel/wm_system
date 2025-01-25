"use client";

import { useState, useEffect, useRef } from "react"; // Added useRef
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
    const [expandedCompany, setExpandedCompany] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [updatedData, setUpdatedData] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showUploadSection, setShowUploadSection] = useState(false);

    const uploadSectionRef = useRef(null);

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    useEffect(() => {
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0]; // Ensure YYYY-MM-DD format
            setDisplayDate(formattedDate);
        }
    }, [selectedDate]);

    // Handle clicks outside the upload section
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (uploadSectionRef.current && !uploadSectionRef.current.contains(event.target)) {
                setShowUploadSection(false);
            }
        };

        // Attach the event listener
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup the event listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDateChange = (date) => {
        setSelectedDate(date);
        if (date) {
            const formattedDate = date.toISOString().split('T')[0]; // Ensure YYYY-MM-DD format
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
            let url = `${BASE_URL}/api/routing/get-data/?date=${displayDate}`;
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
                throw new Error("Failed to fetch data.");
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
            setError("Failed to fetch data. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleQRScan = (id) => {
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
            }
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
        setError("");

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
            setError("Failed to save data. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedState = localStorage.getItem('routingState');
        const scanResult = localStorage.getItem('qrScanResult');

        if (savedState) {
            const { selectedDate, displayDate, data, updatedData } = JSON.parse(savedState);
            setSelectedDate(selectedDate);
            setDisplayDate(displayDate);
            setData(data);
            setUpdatedData(updatedData);
            localStorage.removeItem('routingState');
        }

        if (scanResult) {
            const { id, pos_serial_number } = JSON.parse(scanResult);

            if (id) {
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

    const groupedData = data.reduce((acc, item) => {
        const key = item.company_name;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            validateFile(file);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files[0];
        if (file) {
            validateFile(file);
        }
    };

    const validateFile = (file) => {
        if (!file.name.toLowerCase().endsWith(".xlsx") && !file.name.toLowerCase().endsWith(".xls")) {
            setError("Invalid file type. Only Excel files are allowed.");
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file to upload.");
            return;
        }

        setIsUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/routing/upload-data/`, {
                method: "POST",
                headers: {
                    Authorization: `Token ${token}`,
                },
                body: formData,
            });

            if (response.status === 201) {
                toast.success("Data uploaded successfully!");
                setSelectedFile(null);
                document.getElementById("file").value = "";
                setShowUploadSection(false); // Hide the upload section after successful upload
            } else {
                const errorData = await response.json();
                setError(errorData?.error || "Upload failed. Please try again.");
            }
        } catch (error) {
            console.error("Upload error:", error);
            setError("An error occurred. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AuthWrapper>
            <div className="container">
                <h1>Routing</h1>
                {error && <p className="error-message">{error}</p>}

                {/* Toggleable Upload Section */}
                {user?.is_staff && (
                    !showUploadSection ? (
                        <button
                            onClick={() => setShowUploadSection(true)}
                            className="btn"
                        >
                            Upload File
                        </button>
                    ) : (
                        <div ref={uploadSectionRef}>
                            <div
                                className={`dropzone ${isDragging ? "dragging" : ""}`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <p>Drag and drop a file here, or</p>
                                <div className="file-input-container">
                                    <input
                                        type="file"
                                        id="file"
                                        accept=".xlsx, .xls"
                                        onChange={handleFileChange}
                                    />
                                    <label htmlFor="file" className="file-label">
                                        Choose a file
                                    </label>
                                </div>
                            </div>

                            {selectedFile && (
                                <p className="selected-file">
                                    Selected file: {selectedFile.name}
                                </p>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={isUploading || !selectedFile}
                                className="upload-button"
                            >
                                {isUploading ? <div className="spinner"></div> : "Upload"}
                            </button>
                        </div>
                    )
                )}

            <div className="date-picker-container">
                <label htmlFor="date">Select Date: </label>
                <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    inline
                    dateFormat="dd/MM/yyyy"
                    className="date-picker-input"
                    placeholderText="Select a date"
                    popperPlacement="bottom-start"
                    popperModifiers={{
                        preventOverflow: {
                            enabled: true,
                            boundariesElement: 'viewport',
                        },
                        offset: {
                            enabled: true,
                            offset: '0, 10',
                        },
                    }}
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
                    <div className="outlet"
                        key={companyName}
                    >
                        <h5
                            onClick={() =>
                                setExpandedCompany(
                                    expandedCompany === companyName ? null : companyName
                                )
                            }
                            style={{
                                cursor: "pointer",
                                color: expandedCompany === companyName ? "#0070f3" : "#fff",
                            }}
                        >
                            {companyName}
                        </h5>
                        {expandedCompany === companyName && (
                            <div className="company-outlets-wrapper">
                                {outlets.map((outlet) => (
                                    <div
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
                                            <p className="outlet-sub-details-data"><span>Delivery Address:</span> <span>{outlet.delivery_address}</span></p>
                                            <p className="outlet-sub-details-data">
                                                <span>POS Serial Number: {" "}</span>
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
                                                onClick={() => handleQRScan(outlet.id)}
                                            >
                                                Scan QR
                                            </button>)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
        </AuthWrapper >
    );
}