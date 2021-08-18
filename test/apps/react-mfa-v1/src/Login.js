import React, { useState, useContext } from 'react';
import OktaContext from './OktaContext';

const Login = () => {
  const { oktaAuth, handleTransaction } = useContext(OktaContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();

    const transaction = await oktaAuth.signInWithCredentials({ username, password });
    handleTransaction(transaction);
  };

  const handleUsernameChange = e => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = e => {
    setPassword(e.target.value);
  };
 
  return (
    <form id="login-form" onSubmit={handleSubmit}>
      <h3>MFA Authentication</h3>
      <label htmlFor="username">Username</label><br/>
      <input id="username" type="text" name="username" onChange={handleUsernameChange} /><br/>
      <label htmlFor="password">Password</label><br/>
      <input id="password" type="password" name="password" onChange={handlePasswordChange} /><br/>
      <button id="submit-login-form" type="submit">Login</button>
    </form>
  );
}

export default Login;
