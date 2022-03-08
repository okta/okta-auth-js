import { useEffect } from 'react'; 
import { useHistory } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { useTransaction } from '../TransactionContext';

const LoginCallback = () => {
  const history = useHistory();
  const { setTransaction } = useTransaction();
  const { oktaAuth } = useOktaAuth();

  useEffect(() => {
    const parseFromUrl = async () => {
      try {
        await oktaAuth.idx.handleInteractionCodeRedirect(window.location.href);
        history.push('/');
      } catch (err) {
        console.log(err);
      }
    };

    if (hasErrorInUrl(window.location.search)) {
      const url = new URL(window.location.href);
      const error = new Error(`${url.searchParams.get('error')}: ${url.searchParams.get('error_description')}`);
      setTransaction({
        status: IdxStatus.FAILURE,
        error
      });
      return;
    } else if(oktaAuth.isLoginRedirect()) {
      return parseFromUrl();
    }
    
    const handleEmailVerifyCallback = async () => {
      try {
        const newTransaction = await oktaAuth.idx.handleEmailVerifyCallback(window.location.search);
        setTransaction(newTransaction);
      } catch (error) {
        setTransaction({
          status: IdxStatus.FAILURE,
          error
        });
      } finally {
        history.push('/');
      }
    }

    if (oktaAuth.idx.isEmailVerifyCallback(window.location.search)) {
      return handleEmailVerifyCallback();
    }
  }, [history, setTransaction]);
  
  return null;
};

export default LoginCallback;
