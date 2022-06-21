import React, { useContext } from 'react';
import { useHistory } from 'react-router';
import OktaContext from './OktaContext';
import Profile from './Profile';
import config from './config';

const Home = () => {
  const history = useHistory();
  const { oktaAuth, authState } = useContext(OktaContext);

  const handleLogin = () => history.push('/login');
  const handleLogout = () => oktaAuth.signOut();

  return (
    <div>
      <div id="oidc-config">
        <h3>OIDC config</h3>
        <table>
          <thead>
            <tr>
              <th>Setting</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Issuer</td>
              <td>{config.issuer}</td>
            </tr>
            <tr>
              <td>Client ID</td>
              <td>{config.clientId}</td>
            </tr>
            <tr>
              <td>Requested Scopes</td>
              <td>{config.scopes}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <br/>
      {authState?.isAuthenticated ? (
        <>
          <button id="logout" onClick={handleLogout}>Logout</button>
          <Profile />
        </>
      ) : (
        <button id="login" onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};

export default Home;