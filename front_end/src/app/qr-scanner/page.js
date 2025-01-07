'use client';

import {useCallback, useState} from 'react';
import { useRouter } from 'next/navigation';
import Html5QrcodePlugin from './Html5QrcodePlugin';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/qr-scanner.css';

export default function QRScanner() {
    const router = useRouter();

    // Memorize the success callback to prevent unnecessary re-renders
    const handleScanSuccess = useCallback((decodedText, decodedResult) => {
        console.log(`Code matched = ${decodedText}`, decodedResult);
        router.push(`/search?qr=${decodedText}`);
    }, [router]);

    // Memorize the error callback to prevent unnecessary re-renders
    const handleScanError = useCallback((error) => {
        console.warn(`Code scan error = ${error}`);
    }, []);

    return (
        <div className="container">
            <h1>QR Code Scanner</h1>
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