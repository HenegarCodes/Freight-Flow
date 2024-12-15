import React, { useState } from 'react';
import axios from 'axios';
//import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      console.log('Token stored in localStorage:', localStorage.getItem('token'));
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login error:', error.message);
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleLogin} className="login-form">
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
