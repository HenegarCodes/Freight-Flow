import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <main>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/dashboard" component={Dashboard} />
          </Switch>
          {/* Add login/signup buttons here */}
          <div>
            <Link to="/login"><button>Login</button></Link>
            <Link to="/signup"><button>Signup</button></Link>
          </div>
        </main>
      </Router>
    </div>
  );
}

export default App;
