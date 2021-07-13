---
to: ../generated/<%= dest %>/src/App.jsx
---
<%- include(`${templates}/${generator}/license-banner.t`) %>

import React from 'react';
import { Route, useHistory, Switch } from 'react-router-dom';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { Security, SecureRoute, LoginCallback } from '@okta/okta-react';
import { Container } from 'semantic-ui-react';
import config from './config';
import Home from './Home';
<%- name === 'custom-login' ? `import CustomLoginComponent from './Login';` : '' %>
import Messages from './Messages';
import Navbar from './Navbar';
import Profile from './Profile';
import CorsErrorModal from './CorsErrorModal';

const oktaAuth = new OktaAuth(config.oidc);

const App = () => {
  const history = useHistory(); // example from react-router

  const restoreOriginalUri = async (_oktaAuth, originalUri) => {
    history.replace(toRelativeUrl(originalUri || '/', window.location.origin));
  };

<% if (useSiw === 'true') { -%>
  const customAuthHandler = () => {
    // Redirect to the /login page that has a CustomLoginComponent
    history.push('/login');
  };

  const onAuthResume = async () => {
    history.push('/login');
  };

<% } -%>
  const [corsErrorModalOpen, setCorsErrorModalOpen] = React.useState(false);

  return (
    <Security
      oktaAuth={oktaAuth}
<% if (useSiw === 'true') { -%>
      onAuthRequired={customAuthHandler}
<% } -%>
      restoreOriginalUri={restoreOriginalUri}
    >
      <Navbar {...{ setCorsErrorModalOpen }} />
      <CorsErrorModal {...{ corsErrorModalOpen, setCorsErrorModalOpen }} />
      <Container text style={{ marginTop: '7em' }}>
        <Switch>
          <Route path="/" exact component={Home} />
          <%- name === 'custom-login' ? 
          `<Route path="/login/callback" render={(props) => <LoginCallback {...props} onAuthResume={onAuthResume} />} />
          <Route path="/login" render={() => <CustomLoginComponent {...{ setCorsErrorModalOpen }} />} />` : 
          `<Route path="/login/callback" component={LoginCallback} />` 
          %>
          <SecureRoute path="/messages" component={Messages} />
          <SecureRoute path="/profile" component={Profile} />
        </Switch>
      </Container>
    </Security>
  );
};

export default App;
