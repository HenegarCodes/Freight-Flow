import React from 'react';
import './home.css';

const Home = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Transforming Freight Logistics</h1>
          <p>Your trusted partner for optimized routing and real-time tracking.</p>
          <div className="hero-buttons">
            <button onClick={() => (window.location.href = '/signup')}>Get Started</button>
            <button onClick={() => (window.location.href = '/learn-more')}>Learn More</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Our Key Features</h2>
        <div className="feature-cards">
          <div className="card">
            <h3>Route Optimization</h3>
            <p>Save time and fuel with our advanced algorithms.</p>
          </div>
          <div className="card">
            <h3>Live Tracking</h3>
            <p>Monitor your trips in real-time for better efficiency.</p>
          </div>
          <div className="card">
            <h3>Analytics</h3>
            <p>Track and analyze your freight operations seamlessly.</p>
          </div>
          <div className="card">
            <h3>User-Friendly Interface</h3>
            <p>Experience effortless navigation and control.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial">
          <p>"Freight Flow has revolutionized my freight management!"</p>
          <footer>- John D., Owner-Operator</footer>
        </div>
        <div className="testimonial">
          <p>"I love the live tracking and seamless interface."</p>
          <footer>- Sarah T., Fleet Manager</footer>
        </div>
      </section>
    </div>
  );
};

export default Home;
