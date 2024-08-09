import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (event) => {
        event.preventDefault();
        try {
            // API request to the backend
            await axios.post('http://localhost:5001/api/auth/signup', { email, password });
            navigate('/login');  // Redirect user to login page upon successful signup
        } catch (error) {
            alert('Failed to sign up: ' + (error.response?.data?.message || 'Unknown error'));
        }
    };

    return (
        <div>
            <h1>Signup Page</h1>
            <form onSubmit={handleSignup}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <button type="submit">Signup</button>
            </form>
        </div>
    );
}

export default Signup;
