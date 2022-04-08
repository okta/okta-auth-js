import { useState, useEffect, useCallback } from 'react';
import { OktaAuth } from '@okta/okta-auth-js';
import { Idx } from './IdxContext';
import oidcConfig from './config';
import Layout from './components/Layout';


export default function App() {
  const [client, setClient] = useState(null);
  const [transactions, setTransactions] = useState([]);   // useReducer???
  const [config, setConfig] = useState({});
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [loading, setLoading] = useState(false);

  const proceedWith = useCallback((name, fn, args=[]) => {
    (async function () {
      setLoading(true);
      const newTransaction = await fn(...args);
      console.log('newTransaction: ', newTransaction);
      setTransactions([...transactions, {...newTransaction, name}]);
      setCurrentTransaction(newTransaction);
      setLoading(false);
    })();
  }, [transactions, setTransactions, setLoading]);

  const start = useCallback(() => {
    (async function () {
      if (client) {
        setTransactions([]);
        proceedWith('introspect (start)', client.idx.start);
      }
    })();
  }, [client, proceedWith, setTransactions]);

  useEffect(() => {
    if (!client) {
      // TODO: set config cleaner
      const oktaAuth = new OktaAuth(oidcConfig);
      setClient(oktaAuth);
      setConfig(oidcConfig);
    }
  }, [client, setClient, setConfig]);

  const idxValue = {
    client,
    transactions,
    config,
    currentTransaction,
    proceedWith,
    start
  };

  return (
    <Idx.Provider value={idxValue}>
      <Layout loading={loading} />
    </Idx.Provider>
  );
}
