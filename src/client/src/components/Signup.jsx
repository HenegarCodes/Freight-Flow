import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './form.css';


function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);  // Add success state
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');  // Reset any previous error
    setSuccess(false);  // Reset success message

    // Validate form inputs
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signup`, { username, email, password });
      localStorage.setItem('token', response.data.token); // Store token in localStorage
      setSuccess(true);  // Set success message
      navigate('/dashboard');  // Redirect to dashboard on successful signup
    } catch (error) {
      setError(error.response?.data?.message || 'Signup failed, please try again');
    }
  };

  return (
    <div className="form">
      <h1>Sign Up</h1>
      
      {/* Display success and error messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">User {username} successfully registered!</div>}

      <form onSubmit={handleSubmit}>
        <label className="label">Username</label>
        <input 
          onChange={(e) => setUsername(e.target.value)} 
          className="input" 
          value={username} 
          type="text" 
          required 
        />
        
        <label className="label">Email</label>
        <input 
          onChange={(e) => setEmail(e.target.value)} 
          className="input" 
          value={email} 
          type="email" 
          required 
        />
        
        <label className="label">Password</label>
        <input 
          onChange={(e) => setPassword(e.target.value)} 
          className="input" 
          value={password} 
          type="password" 
          required 
        />
        
        <button type="submit" className="btn">Submit</button>
      </form>
    </div>
  );
}

export default Signup;
