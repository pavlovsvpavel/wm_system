'use client';

import Link from "next/link";
import { useEffect } from "react";
import { useAuth } from '../app/context/AuthContext';
import { toast } from "react-toastify";

export default function Home() {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            toast.error("You are not authenticated. Please log in.");
        }
    }, [isAuthenticated, isLoading]);

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
            <div className="content">
                <img src="/images/Pepsi-logo.png" alt="logo" />
                <h1>Warehouse Management</h1>
                <div className="button-group">
                    <Link href="/login">
                        <button className="button">Login</button>
                    </Link>
                    <Link href="/register">
                        <button className="button">Register</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}