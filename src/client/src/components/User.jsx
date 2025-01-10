import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './User.css';

const User = () => {
  const [userData, setUserData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    username: '',
    email: '',
    password: '',
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token'); // Get token from localStorage
        const response = await axios.get('https://freight-flow.onrender.com/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
        setUpdatedData({
          username: response.data.username || '',
          email: response.data.email || '',
          password: '', // Leave blank for security reasons
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
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
      await axios.put(
        'https://freight-flow.onrender.com/api/auth/user',
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Profile updated successfully!');
      setEditMode(false);
      setUserData({ ...userData, ...updatedData });
    } catch (err) {
      console.error('Error updating user data:', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="user-page">
      <h1>User Profile</h1>
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
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={updatedData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={updatedData.password}
                onChange={handleInputChange}
                placeholder="Enter new password (optional)"
              />
            </div>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setEditMode(false)}>Cancel</button>
          </>
        ) : (
          <>
            <p>
              <strong>Username:</strong> {userData.username}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <button onClick={() => setEditMode(true)}>Edit Profile</button>
          </>
        )}
      </div>
    </div>
  );
};

export default User;
