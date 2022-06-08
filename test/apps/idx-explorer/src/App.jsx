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
  const [step, setStep] = useState(null);
  const [params, setParams] = useState({});

  const proceed = useCallback((name, fn, opts={}) => {
    (async function () {
      setLoading(true);
      const newTransaction = await fn({...params, ...opts});
      console.log('newTransaction: ', newTransaction);
      if (fn === client.idx.start) {
        setTransactions([{...newTransaction, name}]);
      }
      else {
        setTransactions([...transactions, {...newTransaction, name}]);
      }
      setCurrentTransaction(newTransaction);
      setLoading(false);
    })();
  }, [transactions, setTransactions, setLoading, client, params]);

  const proceedWithRem = useCallback((remediation, opts={}) => {
    console.log(remediation);

    const { inputs, name, action } = remediation;

    // action
    if (action) {
      return proceed(name, action, opts);
    }

    // remediation
    if (inputs.length < 1) {
      // proceed with step when no inputs are required
      proceed(name, client.idx.proceed, {step: name});
    }
    else {
      setStep(remediation);
    }
  }, [client, proceed, setStep]);

  const submitForm = useCallback(data => {
    (async function () {
      if (!step) {
        return; // noop
      }

      const { name } = step;
      proceed(name, client.idx.proceed, {step: name, ...data});
    })();
  }, [step, proceed]);

  const start = useCallback(() => {
    (async function () {
      if (client) {
        proceed('introspect (start)', client.idx.start);
      }
    })();
  }, [client, proceed]);

  useEffect(() => {
    if (!client) {
      // TODO: set config cleaner
      const oktaAuth = new OktaAuth(oidcConfig);
      setClient(oktaAuth);
      setConfig(oidcConfig);
    }
  }, [client, setClient, setConfig]);

  useEffect(() => {
    setStep(null);
  }, [currentTransaction, setStep]);

  const idxValue = {
    client,
    transactions,
    config,
    currentTransaction,
    proceedWithRem,
    start,
    step,
    submitForm,
    setIdxParams: setParams,
    idxParams: params
  };

  return (
    <Idx.Provider value={idxValue}>
      <Layout loading={loading} />
    </Idx.Provider>
  );
}
