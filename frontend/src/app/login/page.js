"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { useAuth } from '../context/AuthContext';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useRecaptcha from '../hooks/useRecaptcha.js';


export default function LoginScreen() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { executeRecaptcha, isLoaded } = useRecaptcha();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!username || !password) {
            toast.warning("Please enter both username and password.");
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const recaptchaToken = await executeRecaptcha('login');
            const response = await fetch(`${BASE_URL}/api/accounts/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                    recaptcha_token: recaptchaToken,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 400) {
                    if (errorData.recaptcha) {
                        toast.error(errorData.recaptcha);
                    } else {
                        toast.error("Invalid username or password.");
                    }
                } else if (response.status === 403) {
                    if (errorData.recaptcha) {
                        toast.error(errorData.recaptcha);
                    } else {
                        toast.error("Access denied. Please try again.");
                    }
                } else if (response.status === 503) {
                    toast.error("Could not verify reCAPTCHA. Please try again later.");
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
            // Only handle network errors, not HTTP errors
            if (error instanceof TypeError && error.message === "Failed to fetch") {
                toast.error("Network error");
            }
        } finally {
            setIsSubmitting(false);
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

            <button
                onClick={handleLogin}
                className="login-register-button"
                disabled={isSubmitting || !isLoaded}
                style={{ display: 'flex', justifyContent: 'center' }}
            >
                {isSubmitting ? <div className="spinner"></div> : 'Login'}
            </button>

            <p className="login-register-link">
                Don't have an account?{" "}
                <Link href="/register">Register here</Link>
            </p>
        </div>
    );
}
