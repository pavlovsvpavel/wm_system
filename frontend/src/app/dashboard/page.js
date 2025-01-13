"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from '../context/AuthContext';


export default function Dashboard() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login')
            toast.info("You are not authenticated. Please log in.");
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
            <h1>Dashboard</h1>
            <div className="dashboard-buttons">
                <button onClick={() => router.push("/upload")}>
                    Upload File
                </button>
                <button onClick={() => router.push("/export")}>
                    Export File
                </button>
                <button onClick={() => router.push("/search")}>
                    Search Database
                </button>
                <button onClick={() => router.push("/user-options")}>
                    Settings
                </button>
            </div>
        </div>
    );
}
