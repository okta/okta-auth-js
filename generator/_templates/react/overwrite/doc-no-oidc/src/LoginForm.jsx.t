---
to: ../generated/<%= dest %>/src/LoginForm.jsx
---
<%- include(`${templates}/${generator}/license-banner.t`) %>

import React, { useState } from 'react';
import { useOktaAuth } from '@okta/okta-react';

const LoginForm = () => {
  const { oktaAuth } = useOktaAuth();
  const [pending, setPending] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    oktaAuth.signInWithCredentials({ username, password })
      .then((res) => {
        setPending(true);
        // sessionToken is a one-use token, so make sure this is only called once
        oktaAuth.signInWithRedirect({ sessionToken: res.sessionToken });
      })
      .catch((err) => { console.log(err); });
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  if (pending) {
    // Hide form while sessionToken is converted into id/access tokens
    return null;
  }

  return (
    <form id="login-form" onSubmit={handleSubmit}>
      <label htmlFor="username">
        Username:
        <input
          id="username"
          type="text"
          value={username}
          onChange={handleUsernameChange}
        />
      </label>
      <label htmlFor="password">
        Password:
        <input
          id="password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
        />
      </label>
      <button type="submit" value="Submit" />
    </form>
  );
};

export default LoginForm;
