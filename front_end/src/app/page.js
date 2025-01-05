'use client';

import Link from 'next/link';
import '../styles/home.css';
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/dashboard');
        }
        else {
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
            <div className="content">
                <img src="/images/Pepsi-logo.png" alt="logo"/>
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