'use client';
import { useEffect, useState } from 'react';
import "../../../styles/globals.css";

const Footer = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <footer className={`site-footer ${isVisible ? 'visible' : ''}`}>
            <div className="container-nav">
                <div className="footer-elements">
                    <div className="recaptcha-terms">
                        <p>This site is protected by reCAPTCHA and the Google</p>
                        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and
                        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer"> Terms of Service</a> apply.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;