"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useAuth } from '../context/AuthContext';
import AuthWrapper from "../components/auth/authWrapper";
import { BiSolidTorch } from "react-icons/bi";

export default function QRScanner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated } = useAuth();
    const videoRef = useRef(null);
    const [torchOn, setTorchOn] = useState(false);
    const [useFrontCamera, setUseFrontCamera] = useState(false);
    const [isCameraRunning, setIsCameraRunning] = useState(false);
    const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
    const codeReader = useRef(new BrowserMultiFormatReader());

    // Get the redirect destination from query parameters
    const redirectTo = searchParams.get('redirectTo') || '/search';

    const handleScanSuccess = (decodedText) => {
        if (!isAuthenticated) return;
    
        stopCamera();
    
        if (redirectTo === '/routing') {
            // For the routing page, save the QR data in localStorage
            const id = new URLSearchParams(window.location.search).get('id');
            const qrScanResult = { id, pos_serial_number: decodedText };
    
            // Save the scan result to localStorage
            localStorage.setItem('qrScanResult', JSON.stringify(qrScanResult));
    
            // Redirect to the routing page
            router.replace('/routing');
        } else if (redirectTo === '/search') {
            // Redirect to the search page with the QR code
            router.replace(`/search?qr=${decodedText}`);
        } else {
            console.warn('Unknown redirect destination:', redirectTo);
        }
    };

    // Handle scan errors
    const handleScanError = (error) => {
        console.warn(`Scan error: ${error}`);
    };

    // Check camera permissions
    const checkCameraPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setCameraPermissionGranted(true);
            stream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error('Camera permission denied:', error);
            setCameraPermissionGranted(false);
            alert('Camera access is required to use the scanner. Please enable camera permissions.');
        }
    };

    // Start the camera
    const startCamera = async () => {
        if (!cameraPermissionGranted) {
            await checkCameraPermissions();
            if (!cameraPermissionGranted) return;
        }

        const videoElement = videoRef.current;

        // Configure camera settings for better barcode scanning
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: useFrontCamera ? "user" : "environment",
                focusMode: "continuous",
            },
        };

        codeReader.current.decodeFromConstraints(
            constraints,
            videoElement,
            (result, error) => {
                if (result) {
                    handleScanSuccess(result.getText());
                }
                if (error) {
                    handleScanError(error);
                }
            }
        ).then(() => {
            console.log('Scanner initialized');
            setIsCameraRunning(true);
        }).catch((error) => {
            console.error('Failed to initialize scanner:', error);
        });
    };

    // Stop the camera
    const stopCamera = () => {
        if (codeReader.current) {
            codeReader.current.reset();
            setIsCameraRunning(false);
            console.log('Camera stopped');
        }
    };

    // Initialize camera on component mount
    useEffect(() => {
        checkCameraPermissions().then(() => {
            if (cameraPermissionGranted) {
                startCamera();
            }
        });

        // Cleanup on unmount
        return () => {
            stopCamera();
        };
    }, [cameraPermissionGranted]);

    // Toggle torch (if supported)
    const toggleTorch = async () => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
            const track = stream.getVideoTracks()[0];
            if (track.getCapabilities().torch) {
                await track.applyConstraints({
                    advanced: [{ torch: !torchOn }]
                });
                setTorchOn(!torchOn);
            } else {
                console.warn('Torch not supported on this device');
            }
        }
    };

    // Handle image selection from file input
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);

            // Create an image element
            const img = new Image();
            img.src = imageUrl;

            // Wait for the image to load
            img.onload = async () => {
                if (img.width === 0 || img.height === 0) {
                    console.error('Invalid image dimensions: width or height is 0.');
                    alert('Invalid image. Please upload a valid image.');
                    URL.revokeObjectURL(imageUrl);
                    return;
                }

                try {
                    const result = await codeReader.current.decodeFromImage(img);
                    if (result) {
                        handleScanSuccess(result.getText());
                    } else {
                        console.warn('No barcode found in the image.');
                    }
                } catch (error) {
                    console.error('Failed to scan image:', error);
                    alert('Failed to scan the image. Please try again.');
                }
                URL.revokeObjectURL(imageUrl);
            };

            // Handle image loading errors
            img.onerror = () => {
                console.error('Failed to load image.');
                alert('Failed to load the image. Please try again.');
                URL.revokeObjectURL(imageUrl);
            };
        }
    };

    return (
        <AuthWrapper>
            <div className="qr-scanner-container">
                {/* Scanner Window */}
                <div className='scanner-window'>
                    {/* Video element for camera feed */}
                    <video className='video-element'
                        ref={videoRef}
                        playsInline
                    />

                    {/* Torch button */}
                    <button className='torch-button'
                        onClick={toggleTorch}
                        style={{
                            background: torchOn ? '#ff4444' : 'yellow',
                        }}
                    >
                        <BiSolidTorch />
                    </button>
                </div>

                {/* Control Panel (Buttons Outside Scanner Window) */}
                <div className='control-panel'>
                    {/* Start/Stop buttons */}
                    {isCameraRunning ? (
                        <button className='control-panel-button'
                            onClick={stopCamera}
                            style={{
                                background: '#ff4444',
                            }}
                        >
                            Stop camera
                        </button>
                    ) : (
                        <button className='control-panel-button'
                            onClick={startCamera}
                            style={{
                                background: '#4CAF50',
                            }}
                        >
                            Start camera
                        </button>
                    )}

                    {/* File input for image selection */}
                    <label className='control-panel-button'
                        htmlFor="image-upload"
                        style={{
                            background: '#0070f3',
                        }}
                    >
                        Scan an image file
                    </label>
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            </div>
        </AuthWrapper>
    );
}