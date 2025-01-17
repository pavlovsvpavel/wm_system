'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Html5QrcodePlugin from './Html5QrcodePlugin';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import AuthWrapper from "../components/auth/authWrapper";


export default function QRScanner() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const handleScanSuccess = async (decodedText) => {
        if (!isAuthenticated) return;

        router.replace(`/search?qr=${decodedText}`);
    };

    // Memorize the error callback to prevent unnecessary re-renders
    const handleScanError = useCallback((error) => {
        console.warn(`Code scan error = ${error}`);
    }, []);

    return (
        <AuthWrapper>
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
        </AuthWrapper>
    );
}