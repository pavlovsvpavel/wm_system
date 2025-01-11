"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from '../context/AuthContext';

export default function UploadFile() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login')
            toast.error("You are not authenticated. Please log in.");
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return (
            <div className="loading-spinner">
                <p>Loading</p>
                <div className="spinner"></div>
            </div>
        );
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError("");
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
            setError("");
        }
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

        if (
            !selectedFile.name.toLowerCase().endsWith(".xlsx") &&
            !selectedFile.name.toLowerCase().endsWith(".xls")
        ) {
            setError("Invalid file type. Only Excel files are allowed.");
            return;
        }

        setIsUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
    
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You are not authenticated. Please log in.");
                return;
            }
    
            const response = await fetch(`${BASE_URL}/api/upload/file/`, {
                method: "POST",
                headers: {
                    Authorization: `Token ${token}`,
                },
                body: formData,
            });
    
            if (response.status === 201) {
                toast.success("File uploaded successfully!");
                router.push("/dashboard");
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
        <div className="container">
            <h1>Upload File</h1>
            {error && <p className="error-message">{error}</p>}

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
                disabled={isUploading}
                className="upload-button"
            >
                {isUploading ? <div className="spinner"></div> : "Upload"}
            </button>
        </div>
    );
}
