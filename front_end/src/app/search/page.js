'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/search.css';

export default function SearchPage() {
    const [latestFile, setLatestFile] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [condition, setCondition] = useState('');
    const [scanWarehouse, setScanWarehouse] = useState('');
    const router = useRouter();
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const hasSearchedRef = useRef(false); // Ref to track if search has been performed

    // Fetch the latest file on component mount
    useEffect(() => {
        const fetchLatestFile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('You are not authenticated. Please log in.');
                    return;
                }
            

                const response = await axios.get(`${BASE_URL}/api/upload/latest-file/`, {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                });

                if (response.status === 200) {
                    setLatestFile(response.data);
                }

                else {
                    toast.error('No files found. Please upload a file first.');
                }
            } catch (error) {
                // Extract the error message from the backend response
                const errorMessage = error.response?.data?.error || 'Failed to fetch the latest file.';
                toast.error(errorMessage);
            }
        };

        fetchLatestFile();
    }, [BASE_URL]);


    // Handle QR code value from query parameters
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const qrCodeValue = queryParams.get('qr');

        if (qrCodeValue && !hasSearchedRef.current) {
            setSearchQuery(qrCodeValue);

            if (latestFile) {
                hasSearchedRef.current = true;
                handleSearch(qrCodeValue);
            }
        }
    }, [latestFile]);


    const handleSearch = useCallback(async (query = searchQuery) => {
        if (!query) {
            toast.error('Please enter a serial number.');
            return;
        }

        if (!latestFile) {
            toast.error('No files found. Please upload a file first.');
            return;
        }

        try {
            const row = latestFile.rows.find((row) => row.serial_number === query);

            if (row) {
                setSearchResults(row);
                setCondition(row.condition);
                setScanWarehouse(row.scan_warehouse);
                toast.success('Match found!');
            } else {
                setSearchResults({
                    serial_number: query,
                    item_name: '',
                    account_name: '',
                    account_address: '',
                    warehouse: '',
                    condition: '',
                    scan_warehouse: '',
                });
                setCondition('');
                setScanWarehouse('');
                toast.info('No match found. Click "Save" to add in database.');
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to perform search. Please try again.');
        }
    }, [latestFile, searchQuery]);


    const handleSave = async () => {
        if (!searchResults) {
            toast.error('No data to save.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('You are not authenticated. Please log in.');
                return;
            }

            const response = await axios.patch(`${BASE_URL}/api/search/`,
                {
                    qr_code: searchResults.serial_number,
                    file_id: latestFile.id,
                    condition_data: condition,
                    scan_warehouse_data: scanWarehouse,
                },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                toast.success(response.data.message);
                setSearchQuery('');
                setSearchResults(null);
                setCondition('');
                setScanWarehouse('');

                // Fetch the latest file again after saving
                const fetchLatestFile = async () => {
                    try {
                        const token = localStorage.getItem('token');
                        if (!token) {
                            toast.error('You are not authenticated. Please log in.');
                            return;
                        }

                        const response = await axios.get(`${BASE_URL}/api/upload/latest-file/`, {
                            headers: {
                                Authorization: `Token ${token}`,
                            },
                        });

                        if (response.status === 200) {
                            setLatestFile(response.data);
                        }
                    } catch (error) {
                        // console.error('Error fetching latest file:', error);
                        toast.error(error.response?.data?.error || 'Failed to fetch the latest file. Please try again.');
                    }
                };

                fetchLatestFile();
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.response?.data?.message || 'Failed to save changes. Please try again.');
        }
    };

    return (
        <div className="container">
            <h1>Assets search</h1>
            <div className="latest-file">
                {latestFile && (
                    <p>Last uploaded database: <strong>{latestFile.name}</strong></p>
                )}
            </div>

            <div className="search-input">
                <input
                    type="text"
                    placeholder="Enter serial number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={() => handleSearch()}>Search</button>
                <button onClick={() => router.push('/qr-scanner')}>Scan QR Code</button>
            </div>

            {searchResults && (
                <div className="search-results">
                    <ul>
                        <li>
                            <p>Serial Number:</p>
                            <p>{searchResults.serial_number}</p>
                        </li>
                        <li>
                            <p>Item Name:</p>
                            <p>{searchResults.item_name}</p>
                        </li>
                        <li>
                            <p>Account Name:</p>
                            <p>{searchResults.account_name}</p>
                        </li>
                        <li>
                            <p>Account Address:</p>
                            <p>{searchResults.account_address}</p>
                        </li>
                        <li>
                            <p>Current warehouse:</p>
                            <p>{searchResults.warehouse}</p>
                        </li>
                        <li>
                            <p>Condition:</p>
                            <p>{searchResults.condition}</p>
                        </li>
                        <li>
                            <p>Scanned warehouse:</p>
                            <p>{searchResults.scan_warehouse}</p>
                        </li>
                    </ul>
                </div>
            )}

            {searchResults && (
                <div className="selection-fields">
                    <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                    >
                        <option value="">Select Condition</option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                    </select>

                    <select
                        value={scanWarehouse}
                        onChange={(e) => setScanWarehouse(e.target.value)}
                    >
                        <option value="">Select Warehouse</option>
                        <option value="warehouse1">Warehouse 1</option>
                        <option value="warehouse2">Warehouse 2</option>
                    </select>
                </div>
            )}

            {searchResults && (
                <div className="save-button">
                    <button onClick={handleSave}>Save</button>
                </div>
            )}
        </div>
    );
}