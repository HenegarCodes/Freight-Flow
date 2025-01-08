import React from 'react';
import './home.css';

const Home = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <header className="hero-section">
        <h1>Welcome to Freight Flow</h1>
        <p>The ultimate route planning and freight management solution for trucking professionals.</p>
        <button onClick={() => (window.location.href = '/signup')}>Get Started</button>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <h2>What We Offer</h2>
        <div className="features">
          <div className="feature">
            <h3>Efficient Route Planning</h3>
            <p>Plan your trips with optimized routes, saving time and fuel.</p>
          </div>
          <div className="feature">
            <h3>Real-Time Navigation</h3>
            <p>Get turn-by-turn directions and live traffic updates.</p>
          </div>
          <div className="feature">
            <h3>Trip Tracking</h3>
            <p>Track all your past trips and analyze performance metrics.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonials">
          <blockquote>
            "Freight Flow has revolutionized the way I manage my routes. It's fast, efficient, and reliable!"
            <footer>- John D., Owner-Operator</footer>
          </blockquote>
          <blockquote>
            "The real-time navigation has saved me countless hours on the road. Highly recommend it!"
            <footer>- Sarah T., Fleet Manager</footer>
          </blockquote>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2>Ready to Optimize Your Freight Operations?</h2>
        <button onClick={() => (window.location.href = '/signup')}>Sign Up Now</button>
        <button onClick={() => (window.location.href = '/login')}>Log In</button>
      </section>
    </div>
  );
};

export default Home;
