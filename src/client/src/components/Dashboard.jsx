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
        const response = await axios.get('https://freight-flow.onrender.com/api/trips/recent', {
          headers: { Authorization: `Bearer ${token}` },
        });

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

  // Handle feedback form submission
  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/feedback', feedback);
      setFeedback({ rating: '', comments: '' });
      setShowFeedbackForm(false);
      alert('Feedback sent successfully!');
    } catch (err) {
      console.error('Error sending feedback:', err);
      alert('Failed to send feedback. Please try again.');
    }
  };

  // Handle modal close
  const closeModal = () => {
    setIsModalOpen(false);
  };

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
          <h1>Dashboard</h1>

          <div className="tabs">
            <button className="tab" onClick={() => setSelectedTrip(null)}>
              5 Most Recent Trips
            </button>
            <button className="tab" onClick={() => setSelectedTrip('averages')}>
              Averages
            </button>
          </div>

          {selectedTrip === null && (
            <div className="trips-list">
              <h2>Recent Trips</h2>
              {recentTrips.length > 0 ? (
                recentTrips.map((trip, index) => (
                  <div
                    key={trip._id}
                    className="trip-item"
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <p>
                      <strong>Trip {index + 1}:</strong> {trip.start} → {trip.end}
                    </p>
                    <p>
                      <strong>Date:</strong> {new Date(trip.date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p>No recent trips found.</p>
              )}
            </div>
          )}

          {selectedTrip && selectedTrip !== 'averages' && (
            <div className="trip-details">
              <h2>Trip Details</h2>
              <p>
                <strong>Start:</strong> {selectedTrip.start}
              </p>
              <p>
                <strong>End:</strong> {selectedTrip.end}
              </p>
              <p>
                <strong>Distance:</strong> {selectedTrip.route.distance}
              </p>
              <p>
                <strong>Duration:</strong> {selectedTrip.route.duration}
              </p>
              <p>
                <strong>Date:</strong> {new Date(selectedTrip.date).toLocaleDateString()}
              </p>
              <button onClick={() => setSelectedTrip(null)}>Back to Recent Trips</button>
            </div>
          )}

          {selectedTrip === 'averages' && (
            <div className="averages">
              <h2>Averages</h2>
              <p>
                <strong>Average Distance:</strong> {averages.mileage} miles
              </p>
              <p>
                <strong>Average Time:</strong> {averages.time} minutes
              </p>
              <button onClick={() => setSelectedTrip(null)}>Back</button>
            </div>
          )}

          <div className="fun-section">
            <h2>Fun Fact</h2>
            <p>
              Based on your trips, you've used approximately{' '}
              <strong>
                {recentTrips.reduce((sum, trip) => sum + parseFloat(trip.route.distance.replace(' mi', '')) * 0.14, 0).toFixed(2)}{' '}
                gallons of gas
              </strong>{' '}
              (assuming 7 MPG for freight trucks)!
            </p>
            <button onClick={() => setShowFeedbackForm(true)}>Send Feedback</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
