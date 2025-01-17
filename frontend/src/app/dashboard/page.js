"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '../context/AuthContext';
import AuthWrapper from "../components/auth/authWrapper";


export default function Dashboard() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isAuthenticated && isLoading) return;

    }, [isAuthenticated, isLoading]);

    return (
        <AuthWrapper>
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
        </AuthWrapper>
    );
}
