---
to: ../generated/<%= dest %>/src/Login.jsx
---
<%- include(`${templates}/${generator}/license-banner.t`) %>

import React from 'react';
import { Redirect } from 'react-router-dom';
<%- name === 'signin-widget'
  ? `import OktaSignInWidget from './OktaSignInWidget';`
  : `import LoginForm from './LoginForm';` 
%>
import { useOktaAuth } from '@okta/okta-react';

<%- name === 'signin-widget' 
  ? `const Login = ({ config }) => {` 
  : `const Login = () => {` 
%>
  const { oktaAuth, authState } = useOktaAuth();

  <%- name === 'signin-widget' 
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
    <%- name === 'signin-widget' ?
    `<OktaSignInWidget
      config={config}
      onSuccess={onSuccess}
      onError={onError}/>;` : 
    `<LoginForm />;` 
    %>
};

export default Login;