import React from 'react';
import './App.css';
import Header from'./components/Header.jsx'
import Home from './pages/Home.jsx'

function App() {
  return (
    <div className="App">
 
        <Header />
 
      <main>
        <Home />
        {/*  main content here */}
      </main>
    </div>
  );
}

export default App;
