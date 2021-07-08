---
to: ../generated/<%= dest %>/<%= name %>/src/App.jsx
force: true
---
import React from 'react';
import { Route, useHistory } from 'react-router-dom';
import { Security, SecureRoute, LoginCallback } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import Home from './Home';
import Login from './Login';
import Protected from './Protected';
import config from './config';

const oktaAuth = new OktaAuth(config.oidc);

const App = () => {
  const history = useHistory();

  const customAuthHandler = () => {
    history.push('/login');
  };

  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    history.replace(toRelativeUrl(originalUri, window.location.origin));
  };

  return (
    <Security 
      oktaAuth={oktaAuth}
      onAuthRequired={customAuthHandler}
      restoreOriginalUri={restoreOriginalUri}
    >
      <Route path='/' exact={true} component={Home} />
      <SecureRoute path='/protected' component={Protected} />
      <Route path='/login' render={() => <Login />} />
      <Route path='/login/callback' component={LoginCallback} />
    </Security>
  );
};

export default App;