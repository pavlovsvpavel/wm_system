"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '../context/AuthContext';
import AuthWrapper from "../components/auth/authWrapper";


export default function Dashboard() {
    const router = useRouter();
    const { isAuthenticated, isLoading, user } = useAuth();

    useEffect(() => {
        if (!isAuthenticated && isLoading) return;

    }, [isAuthenticated, isLoading]);

    return (
        <AuthWrapper>
            <div className="container">
                <h1>Dashboard</h1>
                <div className="dashboard-buttons">
                    {user?.is_staff && (
                        <button onClick={() => router.push("/upload")}>
                            Upload database
                        </button>
                    )}
                    {user?.is_staff && (
                        <button onClick={() => router.push("/export")}>
                            Export database
                        </button>
                    )}
                    <button onClick={() => router.push("/search")}>
                        Search in database
                    </button>
                    {user?.is_staff && (
                        <button onClick={() => router.push("/user-options")}>
                            Settings
                        </button>
                    )}
                </div>
            </div>
        </AuthWrapper>
    );
}
