import React from 'react';
import './home.css';

const Home = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="glass-panel">
          <h1>Revolutionizing Freight Logistics</h1>
          <p>Optimized routing, live tracking, and futuristic technology for trucking professionals.</p>
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
            <p>Save time and fuel with advanced algorithms.</p>
          </div>
          <div className="card">
            <h3>Live Tracking</h3>
            <p>Real-time tracking to keep you on the best route.</p>
          </div>
          <div className="card">
            <h3>Analytics</h3>
            <p>Monitor your trips with detailed performance metrics.</p>
          </div>
          <div className="card">
            <h3>Futuristic Interface</h3>
            <p>Experience a sleek, next-generation user experience.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
