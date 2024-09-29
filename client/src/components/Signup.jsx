import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    //check for errors
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(false);

    //name change
    const handleUsername = (e) => {
        setUsername(e.target.value);
        setSubmitted(false);
    };
    
    //password change
    const handlePassword = (e) => {
        setPassword(e.target.value);
        setSubmitted(false);
        };

    //email change
    const handleEmail = (e) => {
        setEmail(e.target.value);
        setSubmitted(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name === ' '|| email === '' || password === ''){
            setError(true);
        } else {
            setSubmitted(true);
            setError(false);
        }
    }
    const successMessage = () => {
        return (
        <div
        className="success"
        style={{
        display: submitted ? '' : 'none',
        }}>
        <h1>User {username} successfully registered!!</h1>
        </div>
        );
        };


  //error if not filled out properly
  const errorMessage = () => {
    return (
    <div
    className="error"
    style={{
    display: error ? '' : 'none',
    }}>
    <h1>Please enter all the fields</h1>
    </div>
    );
    };
    return (
        <div className="form">
        <div>
        <h1> Sign up</h1>
        </div>
        
        {/* Calling to the methods */}
        <div className="messages">
        {errorMessage()}
        {successMessage()}
        </div>
        
        <form>
        {/* Labels and inputs for form data */}
        <label className="label">Username</label>
        <input onChange={handleUsername} className="input"
        value={username} type="text" />
        
        <label className="label">Email</label>
        <input onChange={handleEmail} className="input"
        value={email} type="email" />
        
        <label className="label">Password</label>
        <input onChange={handlePassword} className="input"
        value={password} type="password" />
        
        <button onClick={handleSubmit} className="btn" type="submit">
        Submit
        </button>
        </form>
        </div>
        );
        }

export default Signup;
