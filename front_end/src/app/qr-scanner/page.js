'use client';

import {useCallback, useEffect} from 'react';
import { useRouter } from 'next/navigation';
import Html5QrcodePlugin from './Html5QrcodePlugin';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

export default function QRScanner() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
            toast.error("You are not authenticated. Please log in.");
        }
    }, [isAuthenticated, isLoading, router]);

    // Memorize the success callback to prevent unnecessary re-renders
    const handleScanSuccess = useCallback((decodedText, decodedResult) => {
        console.log(`Code matched = ${decodedText}`, decodedResult);
        router.push(`/search?qr=${decodedText}`);
    }, [router]);

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