import { useEffect, useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { OktaAuth } from '@okta/okta-auth-js';
import OktaContext from './OktaContext';
import Home from './Home';
import Login from './Login';
import SelectAuthenticator from './SelectAuthenticator';
import config from './config';
import ChallengeAuthenticator from './ChallengeAuthenticator';

const oktaAuth = new OktaAuth(config);

function App() {
  const history = useHistory();
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);
  const [authState, setAuthState] = useState(null);

  useEffect(() => {
    oktaAuth.authStateManager.subscribe(setAuthState);
    oktaAuth.start();
    return () => oktaAuth.stop();
  }, []);

  const handleTransaction = async transaction => {
    // update transaction
    setTransaction(transaction);
    // clear previous error
    setError(null);

    const { status, sessionToken } = transaction;
    switch (status) {
      case 'SUCCESS': {
        const { tokens } = await oktaAuth.token.getWithoutPrompt({ sessionToken });
        oktaAuth.tokenManager.setTokens(tokens);
        history.push('/');
        break;
      }
      case 'MFA_REQUIRED': {
        history.push('/select-authenticator');
        break;
      }
      case 'MFA_CHALLENGE': {
        history.push('/challenge-authenticator');
        break;
      }
      default:
        throw new Error(`Status is not supported, status: ${status}`);
    }
  };

  return (
    <OktaContext.Provider value={{ 
      oktaAuth, 
      authState,
      transaction,
      handleTransaction,
      setError
    }}>
      {error && (
        <div>
          <div>Error: {error.errorSummary}</div>
          {error.errorCauses.map(cause => <div key={cause.errorSummary}>{cause.errorSummary}</div>)}
        </div>
      )}
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/select-authenticator" component={SelectAuthenticator} />
        <Route exact path="/challenge-authenticator" component={ChallengeAuthenticator} />
      </Switch>
    </OktaContext.Provider>
  );
}

export default App;
