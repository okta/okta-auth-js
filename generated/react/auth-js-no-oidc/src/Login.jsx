import React from 'react';
import { Redirect } from 'react-router-dom';
import LoginForm from './LoginForm';
import { useOktaAuth } from '@okta/okta-react';

const Login = () => {
  const { oktaAuth, authState } = useOktaAuth();

  
  
  if (!authState) {
    return <div>Loading...</div>;
  }

  return authState.isAuthenticated ?
    <Redirect to={{ pathname: '/' }} /> :
    <LoginForm />;
};

export default Login;