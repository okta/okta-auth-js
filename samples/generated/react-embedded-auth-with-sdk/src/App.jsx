import { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router,
  Switch, 
  Route,
  useHistory
} from 'react-router-dom';
import { 
  OktaAuth, 
  IdxStatus, 
  urlParamsToObject, 
  isRedirectUri 
} from '@okta/okta-auth-js';
import { Security } from '@okta/okta-react';
import HomePage from './components/HomePage';
import ErrorPage from './components/ErrorPage';
import CanceledPage from './components/CanceledPage';
import TerminalPage from './components/TerminalPage';
import FlowPage from './components/FlowPage';
import LoginCallback from './components/LoginCallback';
import Spinner from './components/Spinner';
import { IdxTransaction } from './contexts';
import oidcConfig from './config';

const oktaAuth = (() => {
  const { 
    state, 
    recoveryToken, 
    issuer,
    clientId
   } = urlParamsToObject(window.location.search);
  return new OktaAuth(Object.assign({}, oidcConfig, {
    state,
    recoveryToken,
    // enable dynamic config app config in testing
    ...(issuer && { issuer }),
    ...(clientId && { clientId }),
  }));
})();

const restoreOriginalUri = () => {};

function App() {
  const history = useHistory();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { tokens, status, meta } = transaction || {};
    if (status === IdxStatus.SUCCESS) {
      oktaAuth.tokenManager.setTokens(tokens);
      history.replace('/');
      setTransaction(null);
    } else if (status === IdxStatus.TERMINAL) {
      history.replace('/terminal');
      setTransaction(null);
    } else if (status === IdxStatus.FAILURE) {
      history.replace('/error');
      setTransaction(null);
    } else if (status === IdxStatus.CANCELED) {
      history.replace('/canceled');
      setTransaction(null);
    } else if (status === IdxStatus.PENDING) {
      history.replace(`/flow/${meta.flow}`);
    }
  }, [transaction, history]);

  useEffect(() => {
    const resumeTransaction = async () => {
      setLoading(true);
      const newTransaction = await oktaAuth.idx.proceed();
      setTransaction(newTransaction);
      setLoading(false);
    };

    if (!isRedirectUri(window.location.href, oktaAuth) && oktaAuth.idx.canProceed()) {
      resumeTransaction();
    }
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <Security 
      oktaAuth={oktaAuth} 
      onAuthRequired={() => history.replace('/')}
      restoreOriginalUri={restoreOriginalUri}
    >
      <IdxTransaction.Provider value={{
        transaction,
        setTransaction,
      }}>
        <Switch>
          <Route path="/" exact component={HomePage} />
          <Route path="/login/callback" component={LoginCallback} />
          <Route path="/error" component={ErrorPage} />
          <Route path="/terminal" component={TerminalPage} />
          <Route path="/canceled" component={CanceledPage} />
          <Route path="/flow/:flow" component={FlowPage} />
        </Switch>
      </IdxTransaction.Provider>
    </Security>
  );
}

export default function AppWithRouter() {
  return <Router><App /></Router>
}
