'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from 'next/link';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useRecaptcha from '../hooks/useRecaptcha.js';

export default function RegisterScreen() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { executeRecaptcha, isLoaded } = useRecaptcha();

	const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

	const handleRegister = async () => {
		if (!username || !password || !confirmPassword) {
			toast.warning('Please fill in all fields.');
			return;
		}

		if (password !== confirmPassword) {
			toast.error('Passwords do not match.');
			return;
		}

		setIsSubmitting(true);
		setError('');

		try {
			const recaptchaToken = await executeRecaptcha('register');
			const response = await fetch(`${BASE_URL}/api/accounts/register/`, {
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

			if (response.ok) {
				toast.success('Registration successful.');
				router.push('/login');
				return;
			}

			// Handle error responses
			const errorData = await response.json();
			console.log(errorData)

			if (response.status === 400) {
				if (errorData.recaptcha_token) {
					toast.error(errorData.recaptcha_token);
				} else if (errorData.username) {
					toast.error(errorData.username[0]);
				} else if (errorData.password) {
					toast.error(errorData.password[0]);
				} else {
					toast.error('Invalid registration data. Please check your inputs.');
				}
			} else if (response.status === 403) {
				if (errorData.recaptcha_token) {
					toast.error(errorData.recaptcha_token);
				} else {
					toast.error('Access denied. Please try again.');
				}
			} else if (response.status === 503) {
				toast.error('Could not verify reCAPTCHA. Please try again later.');
			} else {
				toast.error(errorData?.detail || 'Registration failed. Please try again.');
			}
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

	const toggleConfirmPasswordVisibility = () => {
		setShowConfirmPassword((prevState) => !prevState);
	};

	return (
		<div className="container">
			<h1>Register</h1>
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
						type={showPassword ? 'text' : 'password'}
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter your password"
					/>
					<button
						type="button"
						onClick={togglePasswordVisibility}
						className="password-toggle-btn"
					>
						{showPassword ? <FaEyeSlash /> : <FaEye />}
					</button>
				</div>
			</div>

			<div className="form-group">
				<label htmlFor="confirmPassword">Confirm Password</label>
				<div className="password-input">
					<input
						type={showConfirmPassword ? 'text' : 'password'}
						id="confirmPassword"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder="Confirm your password"
					/>
					<button
						type="button"
						onClick={toggleConfirmPasswordVisibility}
						className="password-toggle-btn"
					>
						{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
					</button>
				</div>
			</div>

			<button
				onClick={handleRegister}
				className="login-register-button"
				disabled={isSubmitting || !isLoaded}
				style={{ display: 'flex', justifyContent: 'center' }}
			>
				{isSubmitting ? <div className="spinner"></div> : 'Register'}
			</button>

			<p className="login-register-link">
				Already have an account? <Link href="/login">Login here</Link>
			</p>
		</div>
	);
}
