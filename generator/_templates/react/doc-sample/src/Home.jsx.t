---
to: ../generated/<%= dest %>/src/Home.jsx
---
<%- include(`${templates}/${generator}/license-banner.t`) %>

import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';

const Home = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const history = useHistory();

  const handleLogin = () => {
    history.push('/login');
  };

  const handleLogout = () => {
    oktaAuth.signOut();
  };

  if (!authState) {
    return <div>Loading...</div>;
  }

  return (
    <div id="home">
      <Link to="/">Home</Link>
      <br />
      <Link to="/protected">Protected</Link>
      <br />
      {
        authState.isAuthenticated
          ? <button id="logout-button" type="button" onClick={handleLogout}>Logout</button>
          : <button id="login-button" type="button" onClick={handleLogin}>Login</button>
      }
    </div>
  );
};

export default Home;
