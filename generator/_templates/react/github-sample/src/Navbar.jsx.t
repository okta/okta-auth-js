---
to: ../generated/<%= dest %>/src/Navbar.jsx
---
<%- include(`${templates}/${generator}/license-banner.t`) %>

import { useOktaAuth } from '@okta/okta-react';
import React from 'react';
<% if (useSiw === 'true') { -%>
import { useHistory, Link } from 'react-router-dom';
<% } else { -%>
import { Link } from 'react-router-dom';
<% } -%>
import { Container, Icon, Image, Menu } from 'semantic-ui-react';

const Navbar = ({ setCorsErrorModalOpen }) => {
<% if (useSiw === 'true') { -%>
  const history = useHistory();
<% } -%>
  const { authState, oktaAuth } = useOktaAuth();

  // Note: Can't distinguish CORS error from other network errors
  const isCorsError = (err) => (err.name === 'AuthApiError' && !err.errorCode && err.xhr.message === 'Failed to fetch');

  const login = async () => <%- useSiw === 'true' ?  `history.push('/login')` : 'oktaAuth.signInWithRedirect()' %>;

  const logout = async () => {
    try {
      await oktaAuth.signOut();
    } catch (err) {
      if (isCorsError(err)) {
        setCorsErrorModalOpen(true);
      } else {
        throw err;
      }
    }
  };

  if (!authState) {
    return null;
  }

  return (
    <div>
      <Menu fixed="top" inverted>
        <Container>
          <Menu.Item header>
            <Image size="mini" src="/react.svg" />
            &nbsp;
            <Link to="/">Okta-React Sample Project</Link>
          </Menu.Item>
          {authState.isAuthenticated && (
          <Menu.Item id="messages-button">
            <Icon name="mail outline" />
            <Link to="/messages">Messages</Link>
          </Menu.Item>
          )}
          {authState.isAuthenticated && (
            <Menu.Item id="profile-button">
              <Link to="/profile">Profile</Link>
            </Menu.Item>
          )}
          {authState.isAuthenticated && (
            <Menu.Item id="logout-button" onClick={logout}>Logout</Menu.Item>
          )}
          {!authState.isPending && !authState.isAuthenticated && (
            <Menu.Item onClick={login}>Login</Menu.Item>
          )}
        </Container>
      </Menu>
    </div>
  );
};
export default Navbar;
