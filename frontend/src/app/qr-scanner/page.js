'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Html5QrcodePlugin from './Html5QrcodePlugin';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import { useFile } from "../context/FileContext";


export default function QRScanner() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            toast.info("You are not authenticated. Please log in.");
        }
    }, [isAuthenticated, isLoading, router]);

    const { latestFile, setLatestFile } = useFile();

    const handleScanSuccess = async (decodedText) => {
        if (!latestFile) {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`${BASE_URL}/api/upload/latest-file/`, {
                    method: "GET",
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                });

                if (response.status === 200) {
                    const data = await response.json();
                    setLatestFile(data);
                    toast.success("Database loaded successfully.");
                } else {
                    toast.error("Failed to load the database.");
                }
            } catch (error) {
                console.error("Error fetching latest file:", error);
                toast.error("An error occurred. Please try again.");
            }
        }

        router.replace(`/search?qr=${decodedText}`);
    };

    // Memorize the error callback to prevent unnecessary re-renders
    const handleScanError = useCallback((error) => {
        console.warn(`Code scan error = ${error}`);
    }, []);

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
            <div
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: '500px',
                    position: 'relative',
                    margin: '0 auto',
                }}
            >
                {/* Use the Html5QrcodePlugin component */}
                <Html5QrcodePlugin
                    fps={10}
                    qrbox={{ width: 300, height: 300 }}
                    disableFlip={false}
                    qrCodeSuccessCallback={handleScanSuccess}
                    qrCodeErrorCallback={handleScanError}
                />
            </div>
        </div>
    );
}