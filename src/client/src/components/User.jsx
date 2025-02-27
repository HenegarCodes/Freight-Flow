import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './user.css';

const User = () => {
  const [userData, setUserData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to access this page.');
          return;
        }
        const response = await axios.get('https://freight-flow.onrender.com/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
        setUpdatedData({
          username: response.data.username || '',
          email: response.data.email || '',
          password: '',
        });
        setError('');
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data. Please try again.');
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData({ ...updatedData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to update your profile.');
        return;
      }
      const response = await axios.put(
        'https://freight-flow.onrender.com/api/auth/user',
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Profile updated successfully!');
      setEditMode(false);
      setUserData({ ...userData, ...updatedData, ...response.data });
      setError('');
    } catch (err) {
      console.error('Error updating user data:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="user-page">
      <div className="profile-header">
        <h1>User Profile</h1>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="user-info">
        {editMode ? (
          <>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={updatedData.username}
                onChange={handleInputChange}
                placeholder="Enter your username"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={updatedData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={updatedData.password}
                onChange={handleInputChange}
                placeholder="Enter a new password (optional)"
              />
            </div>
            <div className="button-group">
              <button onClick={handleSave} className="save-button">Save</button>
              <button onClick={() => setEditMode(false)} className="cancel-button">Cancel</button>
            </div>
          </>
        ) : (
          <>
            <p>
              <strong>Username:</strong> {userData.username}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <button onClick={() => setEditMode(true)} className="edit-button">Edit Profile</button>
          </>
        )}
      </div>
    </div>
  );
};

export default User;
