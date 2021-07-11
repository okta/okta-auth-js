---
to: ../generated/<%= dest %>/src/Login.jsx
---
<%- include(`${templates}/${generator}/license-banner.t`) %>

import React from 'react';
import { Redirect } from 'react-router-dom';
<%- useSiw === 'true'
  ? `import OktaSignInWidget from './OktaSignInWidget';`
  : `import LoginForm from './LoginForm';` 
%>
import { useOktaAuth } from '@okta/okta-react';

<%- useSiw === 'true' 
  ? `const Login = ({ config }) => {` 
  : `const Login = () => {` 
%>
  const { oktaAuth, authState } = useOktaAuth();

  <%- useSiw === 'true' 
  ? `const onSuccess = (tokens) => {
    oktaAuth.handleLoginRedirect(tokens);
  };

  const onError = (err) => {
    console.log('error logging in', err);
  };` 
  : `` %>
  
  if (!authState) {
    return <div>Loading...</div>;
  }

  return authState.isAuthenticated ?
    <Redirect to={{ pathname: '/' }} /> :
    <%- useSiw === 'true' ?
    `<OktaSignInWidget
      config={config}
      onSuccess={onSuccess}
      onError={onError}/>;` : 
    `<LoginForm />;` 
    %>
};

export default Login;