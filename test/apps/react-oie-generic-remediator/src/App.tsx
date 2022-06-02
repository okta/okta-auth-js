import { useState, useMemo, useCallback, useEffect } from 'react';
import { OktaAuth, IdxTransaction, IdxStatus, IdxMessage } from '@okta/okta-auth-js';
import { transformIdxTransaction } from './transformer';
import Form from './components/Form';
import Spinner from './components/Spinner';
import { WidgetContext } from './contexts';
import oidcConfig from './config';
import { usePolling } from './hooks/usePolling';

const authClient = new OktaAuth(Object.assign({}, oidcConfig, {
  idx: { useGenericRemediator: true }
}));

function App() {
  const [idxTransaction, setIdxTransaction] = useState<IdxTransaction | undefined>();
  const [messages, setMessages] = useState<IdxMessage[]>([]);
  const pollingTransaction = usePolling(idxTransaction);

  // Derived value from idxTransaction
  const uischema = useMemo(() => {
    if (!idxTransaction) {
      return undefined;
    }

    return transformIdxTransaction(idxTransaction);
  }, [idxTransaction]);

  const bootstrap = useCallback(async () => {
    const transaction = await authClient.idx.start();
    setIdxTransaction(transaction);
  }, [authClient, setIdxTransaction]);

  const resume = useCallback(async () => {
    const transaction = await authClient.idx.proceed();
    setIdxTransaction(transaction);
  }, [authClient, setIdxTransaction]);

  useEffect(() => {
    if (authClient.idx.canProceed()) {
      resume();
    } else {
      bootstrap();
    }
  }, [authClient, setIdxTransaction, bootstrap, resume]);

  // Update idxTransaction when new status comes back from polling
  useEffect(() => {
    if (!idxTransaction || !pollingTransaction) {
      return;
    }

    if (pollingTransaction.nextStep?.name !== idxTransaction.nextStep?.name) {
      setIdxTransaction(pollingTransaction);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pollingTransaction, // only watch on pollingTransaction changes
  ]);

  useEffect(() => {
    if (!idxTransaction) {
      return;
    }

    const { messages: newMessages, status } = idxTransaction;
    switch (status) {
      case (IdxStatus.PENDING): {
        // Handle global errors or warnings
        if (newMessages) {
          setMessages(newMessages);
        }

        break;
      }
      case (IdxStatus.SUCCESS): {
        // setDisplayState(IdxStatus.SUCCESS);
        break;
      }
      case (IdxStatus.CANCELED): {
        // clear idxTransaction to start loading state
        setIdxTransaction(undefined);
        break;
      }
      default: {
        // error statuses: TERMINAL or FAILURE.
        // setDisplayState(status);
        if (newMessages) {
          // Set error.
          setMessages(newMessages);
        }
      }
    }
  }, [idxTransaction]);

  return (
    <WidgetContext.Provider value={{
      authClient,
      idxTransaction,
      setIdxTransaction,
    }}>
      {
        uischema
          ? <Form uischema={uischema} />
          : <Spinner />
      }
    </WidgetContext.Provider>
  );
};

export default App
