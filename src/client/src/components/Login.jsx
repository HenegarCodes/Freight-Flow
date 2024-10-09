import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token); // Store token in localStorage
      navigate('/dashboard');  // Redirect to dashboard on successful login
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed, please try again');
    }
  };

  return (
    <div className="form">
      <h1>Login</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input 
          onChange={(e) => setEmail(e.target.value)} 
          value={email} 
          type="email" 
          required 
        />
        
        <label>Password</label>
        <input 
          onChange={(e) => setPassword(e.target.value)} 
          value={password} 
          type="password" 
          required 
        />
        
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
