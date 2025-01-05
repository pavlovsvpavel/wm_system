'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../../styles/login.css';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/accounts/login/`, {
        username,
        password,
      });

      if (response.status !== 200 || !response.data.token) {
        setError('Invalid username or password.');
        return;
      }

      const { token } = response.data;
      console.log('Login successful. Token:', token);

      localStorage.setItem('token', token);
      // document.cookie = `token=${token}; path=/; Secure; SameSite=Strict`;

      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);

      if (error.response && error.response.status === 400) {
        setError('Invalid username or password.');
      } else {
        setError('An error occurred. Please try again.');
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
        <div className="password-container">
          <input
            type={showPassword ? 'text' : 'password'}
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
      <button onClick={handleLogin} className="login-button">
        Login
      </button>
      <p className="register-link">
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
}
