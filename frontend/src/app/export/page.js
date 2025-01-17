"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from '../context/AuthContext';
import { useFetchFiles } from '../hooks/useFetchFiles';
import AuthWrapper from "../components/auth/authWrapper";

export default function ExportFile() {
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [isExporting, setIsExporting] = useState(false);
    const { isAuthenticated, isLoading } = useAuth();
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const { files } = useFetchFiles(isAuthenticated, BASE_URL);

    const handleFileChange = (event) => {
        setSelectedFileId(event.target.value);
    };

    const handleExport = async () => {
        setIsExporting(true);

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
                link.setAttribute("download", filename);
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

    return (
        <AuthWrapper>
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
        </AuthWrapper>
    );
}
