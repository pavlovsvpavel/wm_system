"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Please enter both username and password.");
            return;
        }

        try {
            const response = await axios.post(
                `${BASE_URL}/api/accounts/login/`,
                {
                    username,
                    password,
                }
            );

            if (response.status !== 200 || !response.data.token) {
                setError("Invalid username or password.");
                return;
            }

            const { token } = response.data;

            login(token);
            router.push("/dashboard");
        } catch (error) {
            console.error("Login error:", error);

            if (error.response && error.response.status === 400) {
                setError("Invalid username or password.");
            } else {
                setError("An error occurred. Please try again.");
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prevState) => !prevState);
    };

    return (
        <div className="container">
            <h1>Login</h1>
            {error && <p className="error-message">{error}</p>}
            
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                    />
                    <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
            </div>

            <button onClick={handleLogin} className="login-register-button">
                Login
            </button>

            <p className="login-register-link">
                Don't have an account?{" "}
                <Link href="/register">Register here</Link>
            </p>
        </div>
    );
}
