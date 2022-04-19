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

  const proceedWith = useCallback((name, fn, args=[]) => {
    (async function () {
      setLoading(true);
      const newTransaction = await fn(...args);
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
  }, [transactions, setTransactions, setLoading, client]);

  const proceedWithAction = useCallback((key, args=[]) => {
    if (currentTransaction.actions[key]) {
      proceedWith(key, currentTransaction.actions[key], args);
    }
  }, [proceedWith, currentTransaction]);

  const proceedWithRem = useCallback((stepName) => {
    console.log(currentTransaction);
    const steps = currentTransaction?.availableSteps;
    if (!steps) {
      // TODO: revisit
      return; // noop
    }

    const stepObj = steps.find(({name}) => stepName === name);
    if (!stepObj) {
      //TODO: revisit
      return; //noop
    }

    if (stepObj.inputs.length < 1) {
      // proceed with step when no inputs are required
      proceedWith(stepName, client.idx.proceed, [{step: stepName}]);
    }
    else {
      setStep(stepObj);
    }
  }, [currentTransaction, client, proceedWith, setStep]);

  const submitForm = useCallback(data => {
    (async function () {
      if (!step) {
        return; // noop
      }

      const { name } = step;
      proceedWith(name, client.idx.proceed, [{step: name, ...data}]);
    })();
  }, [step, proceedWith]);

  const start = useCallback(() => {
    (async function () {
      if (client) {
        proceedWith('introspect (start)', client.idx.start);
      }
    })();
  }, [client, proceedWith]);

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
    proceedWithAction,
    proceedWithRem,
    start,
    step,
    submitForm
  };

  return (
    <Idx.Provider value={idxValue}>
      <Layout loading={loading} />
    </Idx.Provider>
  );
}
