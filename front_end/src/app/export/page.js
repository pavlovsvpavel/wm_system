'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/export.css';

export default function ExportFile() {
    const [files, setFiles] = useState([]);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('You are not authenticated. Please log in.');
                    return;
                }

                const response = await axios.get(`${BASE_URL}/api/upload/get-files/`, {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                });

                if (response.status === 200) {
                    setFiles(response.data);
                }
            } catch (error) {
                console.error('Error fetching files:', error);
                toast.error('Failed to fetch files. Please try again.');
            }
        };

        fetchFiles();
    }, [BASE_URL]);

    const handleFileChange = (event) => {
        setSelectedFileId(event.target.value);
    };

    const handleExport = async () => {
        if (!selectedFileId) {
            toast.error('Please select a file to export.');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('You are not authenticated. Please log in.');
                return;
            }

            const response = await axios.get(`${BASE_URL}/api/export/${selectedFileId}/`, {
                headers: {
                    Authorization: `Token ${token}`,
                },
                responseType: 'blob',
            });

            if (response.status === 200) {
                const contentDisposition = response.headers['content-disposition'];
                let filename = 'exported_file.xlsx';

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();

                toast.success('File exported successfully!');
            }
        } catch (error) {
            console.error('Export error:', error);
            if (error.response) {
                if (error.response.status === 404) {
                    toast.error('File not found. Please check the file ID.');
                } else {
                    toast.error('Failed to export file. Please try again.');
                }
            } else {
                toast.error('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>Export Database</h1>

            <div className="file-selection">
                <label htmlFor="file-select">Select a database to export:</label>
                <select
                    id="file-select"
                    value={selectedFileId || ''}
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

            <button onClick={handleExport} disabled={!selectedFileId} className="export-button">
                {isLoading ? 'Exporting...' : 'Export'}
            </button>
        </div>
    );
}