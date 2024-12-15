import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import './Dashboard.css';

const Dashboard = () => {
  const [recentTrips, setRecentTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [averages, setAverages] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: '',
    comments: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/check'); // Example route to verify authentication
        setIsLoggedIn(response.data.isAuthenticated);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch the 5 most recent trips
  useEffect(() => {
    if (isLoggedIn) {
      const fetchTrips = async () => {
        try {
          const response = await axios.get('/api/trips/recent');
          setRecentTrips(response.data);

          // Calculate averages
          const avgTime = (
            response.data.reduce((sum, trip) => sum + parseFloat(trip.duration.replace(' mins', '')), 0) /
            response.data.length
          ).toFixed(2);
          const avgMileage = (
            response.data.reduce((sum, trip) => sum + parseFloat(trip.distance.replace(' mi', '')), 0) /
            response.data.length
          ).toFixed(2);

          setAverages({ time: avgTime, mileage: avgMileage });
        } catch (error) {
          console.error('Error fetching recent trips:', error);
        }
      };

      fetchTrips();
    }
  }, [isLoggedIn]);

  // Handle feedback form submission
  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/feedback', feedback);
      setFeedback({ rating: '', comments: '' });
      setShowFeedbackForm(false);
      alert('Feedback sent successfully!');
    } catch (error) {
      console.error('Error sending feedback:', error);
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
        // Show modal if user is not logged in
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
            <a href="/login" className="sign-in-link">Sign In</a>
          </div>
        </Modal>
      ) : (
        // Render dashboard if logged in
        <>
          <h1>Dashboard</h1>

          {/* Tabs */}
          <div className="tabs">
            <button className="tab" onClick={() => setSelectedTrip(null)}>
              5 Most Recent Trips
            </button>
            <button className="tab" onClick={() => setSelectedTrip('averages')}>
              Averages
            </button>
          </div>

          {/* Display Trips */}
          {selectedTrip === null && (
            <div className="trips-list">
              <h2>Recent Trips</h2>
              {recentTrips.map((trip, index) => (
                <div
                  key={trip._id}
                  className="trip-item"
                  onClick={() => setSelectedTrip(trip)}
                >
                  <p><strong>Trip {index + 1}</strong>: {trip.start} → {trip.end}</p>
                  <p><strong>Date:</strong> {new Date(trip.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Display Selected Trip Details */}
          {selectedTrip && selectedTrip !== 'averages' && (
            <div className="trip-details">
              <h2>Trip Details</h2>
              <p><strong>Start:</strong> {selectedTrip.start}</p>
              <p><strong>End:</strong> {selectedTrip.end}</p>
              <p><strong>Distance:</strong> {selectedTrip.distance}</p>
              <p><strong>Duration:</strong> {selectedTrip.duration}</p>
              <p><strong>Date:</strong> {new Date(selectedTrip.date).toappleleDateString()}</p>
              <button onClick={() => setSelectedTrip(null)}>Back to Recent Trips</button>
            </div>
          )}

          {/* Display Averages */}
          {selectedTrip === 'averages' && (
            <div className="averages">
              <h2>Averages from Recent Trips</h2>
              <p><strong>Average Distance:</strong> {averages.mileage} miles</p>
              <p><strong>Average Time:</strong> {averages.time} minutes</p>
              <button onClick={() => setSelectedTrip(null)}>Back</button>
            </div>
          )}

          {/* Fun Section */}
          <div className="fun-section">
            <h2>Fun Fact</h2>
            <p>
              Based on your recent trips, you've used approximately{' '}
              <strong>
                {recentTrips.reduce((sum, trip) => sum + parseFloat(trip.distance.replace(' mi', '')) * 0.14, 0).toFixed(2)} gallons
              </strong>{' '}
              of gas! (Assuming 7 MPG for freight trucks)
            </p>
            <button onClick={() => setShowFeedbackForm(true)}>Send Feedback</button>
          </div>

          {/* Feedback Form */}
          {showFeedbackForm && (
            <Modal
              isOpen={showFeedbackForm}
              onRequestClose={() => setShowFeedbackForm(false)}
              className="feedback-modal"
              overlayClassName="modal-overlay"
              contentLabel="Feedback Form"
            >
              <div className="modal-content">
                <h2>Feedback</h2>
                <form onSubmit={submitFeedback}>
                  <label>
                    Rating:
                    <select
                      value={feedback.rating}
                      onChange={(e) => setFeedback({ ...feedback, rating: e.target.value })}
                      required
                    >
                      <option value="">Choose a rating</option>
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Neutral</option>
                      <option value="2">2 - Needs Improvement</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </label>
                  <label>
                    Comments:
                    <textarea
                      value={feedback.comments}
                      onChange={(e) => setFeedback({ ...feedback, comments: e.target.value })}
                      placeholder="Write your comments here"
                      required
                    />
                  </label>
                  <button type="submit">Submit</button>
                  <button type="button" onClick={() => setShowFeedbackForm(false)}>
                    Cancel
                  </button>
                </form>
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
