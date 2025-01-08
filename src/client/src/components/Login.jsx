import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log('Form data:', { email, password }); // Debugging log

    try {
      const response = await axios.post(
        'https://freight-flow.onrender.com/api/auth/login',
        { email, password }
      );

      console.log('Login successful:', response.data); // Debugging log
      setSuccessMessage('Login successful! Redirecting...');
      setError('');

      // Save the JWT token to localStorage for authentication persistence
      localStorage.setItem('token', response.data.token);

      // Redirect the user after successful login
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error) {
      console.error('Login error:', error.response || error.message); // Debugging log
      if (error.response && error.response.status === 400) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
      setSuccessMessage('');
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Login</h2>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
