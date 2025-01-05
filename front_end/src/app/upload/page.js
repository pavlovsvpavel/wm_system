'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import '../../styles/upload.css';
import { toast } from 'react-toastify';

export default function UploadFile() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const router = useRouter();

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setError('');
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const file = event.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
            setError('');
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
            setError('Please select a file to upload.');
            return;
        }

        if (!selectedFile.name.toLowerCase().endsWith('.xlsx') && !selectedFile.name.toLowerCase().endsWith('.xls')) {
            setError('Invalid file type. Only Excel files are allowed.');
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('You are not authenticated. Please log in.');
                return;
            }

            const response = await axios.post(`${BASE_URL}/api/upload/file/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Token ${token}`,
                },
            });

            if (response.status === 201) {
                toast.success('File uploaded successfully!');
                router.push('/dashboard');
            } else {
                setError('Upload failed. Please try again.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError(error.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container">
            <h1>Upload File</h1>
            {error && <p className="error-message">{error}</p>}

            <div
                className={`dropzone ${isDragging ? 'dragging' : ''}`}
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
                <p className="selected-file">Selected file: {selectedFile.name}</p>
            )}

            <button onClick={handleUpload} disabled={isUploading} className="upload-button">
                {isUploading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
}