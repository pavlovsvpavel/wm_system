"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from '../context/AuthContext';
import { useFetchFiles } from '../hooks/useFetchFiles';
import { useFile } from "../context/FileContext";
import AuthWrapper from "../components/auth/authWrapper";

export default function UploadFile() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const router = useRouter();
    const { isAuthenticated, logout } = useAuth();
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const { files: uploadedFiles } = useFetchFiles(isAuthenticated, BASE_URL);
    const { setLatestFile } = useFile();

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

    // Validate the file type and check for duplicate names
    const validateFile = (file) => {
        if (!file.name.toLowerCase().endsWith(".xlsx") && !file.name.toLowerCase().endsWith(".xls")) {
            setError("Invalid file type. Only Excel files are allowed.");
            setSelectedFile(null);
            return;
        }

        // Check if a file with the same name already exists
        const isDuplicate = uploadedFiles.some(
            (uploadedFile) => uploadedFile.name === file.name
        );

        if (isDuplicate) {
            setError("A file with the same name already exists. Please rename the file or choose a different one.");
            setSelectedFile(null);
        } else {
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

        setIsUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const token = localStorage.getItem("token");
            const response = await fetch(`${BASE_URL}/api/files/upload-file/`, {
                method: "POST",
                headers: {
                    Authorization: `Token ${token}`,
                },
                body: formData,
            });

            if (response.status === 201) {
                toast.success("File uploaded successfully!");
                router.push("/dashboard");
                sessionStorage.removeItem("latest_file_id");
                sessionStorage.removeItem("latest_file_name");
                setLatestFile(null);
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
                <h1>Upload database</h1>
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
        </AuthWrapper>
    );
}