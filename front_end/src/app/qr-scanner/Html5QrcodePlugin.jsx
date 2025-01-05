import { Html5QrcodeScanner, Html5QrcodeScannerState } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

const qrcodeRegionId = "qr-reader";

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props) => {
    let config = {};
    if (props.fps) {
        config.fps = props.fps;
    }
    if (props.qrbox) {
        config.qrbox = props.qrbox;
    }
    if (props.aspectRatio) {
        config.aspectRatio = props.aspectRatio;
    }
    if (props.disableFlip !== undefined) {
        config.disableFlip = props.disableFlip;
    }
    return config;
};

const Html5QrcodePlugin = (props) => {
    const scannerRef = useRef(null); // Ref to store the scanner instance

    useEffect(() => {
        const initiatedStates = [
            Html5QrcodeScannerState.SCANNING,
            Html5QrcodeScannerState.PAUSED
        ];

        // Only initialize the scanner if it hasn't been initialized or is in an initiated state
        if (!scannerRef.current || initiatedStates.includes(scannerRef.current?.getState())) {
            const config = createConfig(props);
            const verbose = props.verbose === true;

            // Success callback is required.
            if (!props.qrCodeSuccessCallback) {
                throw "qrCodeSuccessCallback is required callback.";
            }

            // Initialize the scanner
            const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
            html5QrcodeScanner.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);

            // Store the scanner instance in the ref
            scannerRef.current = html5QrcodeScanner;

            console.log('Scanner initialized');
        }

        // Cleanup function when component unmounts
        return () => {
            if (scannerRef.current && initiatedStates.includes(scannerRef.current?.getState())) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
                scannerRef.current = null;
                console.log('Scanner cleaned up');
            }
        };
    }, [props.qrCodeSuccessCallback, props.qrCodeErrorCallback, props.verbose]);

    return (
        <div id={qrcodeRegionId} />
    );
};

export default Html5QrcodePlugin;