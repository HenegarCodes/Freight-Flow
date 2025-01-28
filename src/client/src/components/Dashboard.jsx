import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './Dashboard.css';

const Dashboard = () => {
  const [recentTrips, setRecentTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [averages, setAverages] = useState({ time: 0, mileage: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState({ rating: '', comments: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  // Check if the user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoggedIn(false);
          return;
        }

        const response = await axios.get('https://freight-flow.onrender.com/api/auth/check', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsLoggedIn(response.data.isAuthenticated);
      } catch (err) {
        console.error('Authentication check failed:', err);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch the 5 most recent trips
  useEffect(() => {
    const fetchTrips = async () => {
      if (!isLoggedIn) return;

      try {
        const token = localStorage.getItem('token');
        console.log('Using token:', token);
        const response = await axios.get('https://freight-flow.onrender.com/api/trips/recent', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched trips response:', response.data);

        if (response.data && Array.isArray(response.data)) {
          setRecentTrips(response.data);

          // Calculate averages
          const avgTime = (
            response.data.reduce((sum, trip) => sum + parseFloat(trip.route.duration.replace(' mins', '')), 0) /
            response.data.length
          ).toFixed(2);

          const avgMileage = (
            response.data.reduce((sum, trip) => sum + parseFloat(trip.route.distance.replace(' mi', '')), 0) /
            response.data.length
          ).toFixed(2);

          setAverages({ time: avgTime, mileage: avgMileage });
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Failed to load trips. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching recent trips:', err);
        setError('Failed to load trips. Please try again later.');
      }
    };

    fetchTrips();
  }, [isLoggedIn]);

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="dashboard">
      {!isLoggedIn ? (
        <Modal
          isOpen={!isLoggedIn}
          onRequestClose={closeModal}
          className="auth-modal"
          overlayClassName="modal-overlay"
          contentLabel="Authentication Required"
        >
          <div className="modal-content">
            <h2>Oops!</h2>
            <p>It looks like you aren't signed in. Please sign in to see your dashboard!</p>
            <a href="/login" className="sign-in-link">
              Sign In
            </a>
          </div>
        </Modal>
      ) : (
        <>
          <header className="dashboard-header">
            <h1>Welcome to Your Dashboard</h1>
            <br />
            <p>Monitor recent trips, analyze performance, and improve efficiency.</p>
          </header>

          <div className="tabs">
            <button className="tab" onClick={() => setSelectedTrip(null)}>
              Recent Trips
            </button>
            <button className="tab" onClick={() => setSelectedTrip('averages')}>
              Averages
            </button>
          </div>

          {selectedTrip === null && (
            <div className="trips-section">
              <h2>Recent Trips</h2>
              {recentTrips.length > 0 ? (
                <div className="trips-container">
                  {recentTrips.map((trip, index) => (
                    <div
                      key={trip._id}
                      className="trip-card"
                      onClick={() => setSelectedTrip(trip)}
                    >
                      <p>
                        <strong>Trip {index + 1}:</strong> {trip.start} → {trip.end}
                      </p>
                      <p>
                        <strong>Date:</strong> {new Date(trip.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No recent trips found.</p>
              )}
            </div>
          )}

          {selectedTrip === 'averages' && (
            <div className="averages-section">
              <h2>Trip Averages</h2>
              <p>
                <strong>Average Distance:</strong> {averages.mileage} miles
              </p>
              <p>
                <strong>Average Time:</strong> {averages.time} minutes
              </p>
              <button onClick={() => setSelectedTrip(null)}>Back</button>
            </div>
          )}

          <footer className="dashboard-footer">
            <p>
              Based on your trips, you've used approximately{' '}
              <strong>
                {recentTrips.reduce((sum, trip) => sum + parseFloat(trip.route.distance.replace(' mi', '')) * 0.14, 0).toFixed(2)}{' '}
                gallons of gas
              </strong>{' '}
              (assuming 7 MPG for freight trucks).
            </p>
          </footer>
        </>
      )}
    </div>
  );
};

export default Dashboard;
