'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../styles/dashboard.css';
import {toast} from "react-toastify";

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            toast.error('You are not authenticated. Please log in.');
        } else {
            setLoading(false);
        }
    }, [router]);

    if (loading) {
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
                <button onClick={() => router.push('/upload')}>Upload File</button>
                <button onClick={() => router.push('/export')}>Export File</button>
                <button onClick={() => router.push('/search')}>Search Database</button>
            </div>
        </div>
    );
}