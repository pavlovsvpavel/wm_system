"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from '../context/AuthContext';


export default function ExportFile() {
    const [files, setFiles] = useState([]);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            toast.info("You are not authenticated. Please log in.");
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            const fetchFiles = async () => {
                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(`${BASE_URL}/api/files/get-files/`, {
                        method: "GET",
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    });

                    if (response.status === 200) {
                        const data = await response.json();
                        setFiles(data);
                        toast.success("Databases loaded successfully.")
                    }
                    else if (response.status === 204) {
                        toast.info("No uploaded databases.");
                        setFiles([]);
                    } 
                    else {
                        toast.error("Failed to fetch databases.")
                    }
                } catch (error) {
                    console.error("Error fetching files:", error);
                    toast.error("Failed to fetch databases. Please try again.");
                }
            };

            fetchFiles();
        }
    }, [isAuthenticated, BASE_URL, router]);

    const handleFileChange = (event) => {
        setSelectedFileId(event.target.value);
    };

    const handleExport = async () => {
        setIsExporting(true);
        if (isAuthenticated) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(
                    `${BASE_URL}/api/export/${selectedFileId}/`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    }
                );

                if (response.status === 200) {
                    const contentDisposition = response.headers.get("Content-Disposition");

                    // Extract filename from Content-Disposition header
                    let filename = "exported_file.xlsx";

                    if (contentDisposition) {
                        // Extract filename using regex
                        const match = contentDisposition.match(/filename="([^"]+)"/);
                        if (match && match[1]) {
                            filename = match[1];
                        }
                    }

                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.setAttribute("download", filename); // Use the extracted filename
                    document.body.appendChild(link);
                    link.click();
                    link.remove();

                    toast.success("File exported successfully!");
                } else {
                    throw new Error("Export failed");
                }
            } catch (error) {
                console.error("Export error:", error);
                if (error.message === "Export failed") {
                    toast.error("Failed to export file. Please try again.");
                } else if (error.response && error.response.status === 404) {
                    toast.error("File not found. Please check the file ID.");
                } else {
                    toast.error("An unexpected error occurred. Please try again.");
                }
            } finally {
                setIsExporting(false);
            }
        };
    }

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
            <h1>Export Database</h1>

            <div className="file-selection">
                <label htmlFor="file-select">
                    Select a database to export:
                </label>
                <select
                    id="file-select"
                    value={selectedFileId || ""}
                    onChange={handleFileChange}
                    disabled={isLoading}
                >
                    <option value="">-- Select a database --</option>
                    {files.map((file) => (
                        <option key={file.id} value={file.id}>
                            {file.name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleExport}
                disabled={!selectedFileId || isExporting}
                className="export-button"
            >
                {isExporting ? <div className="spinner"></div> : "Export"}
            </button>
        </div>
    );
}
