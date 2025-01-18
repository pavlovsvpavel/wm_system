"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { useAuth } from '../context/AuthContext';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
            toast.warning("Please enter both username and password.");
            return;
        }
    
        try {
            const response = await fetch(`${BASE_URL}/api/accounts/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });
    
            if (!response.ok) {
                if (response.status === 400) {
                    toast.error("Invalid username or password.");
                } else {
                    toast.error("An error occurred. Please try again.");
                }
                return;
            }
    
            const data = await response.json();
    
            if (!data.token) {
                setError("Invalid token.");
                return;
            }
    
            const { token } = data;
            const { user } = data;
    
            login(token, user);
            router.push("/dashboard");
            toast.success('Login successful.')
        } catch (error) {
            toast.error("Login error. Please try again.");
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
