import { useCallback, useEffect } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { Box, Link } from '@okta/odyssey-react';
import { useIdxTransaction } from '../../contexts';
import GeneralForm from '../GeneralForm';
import IdpForm from '../IdpForm';

import classes from './FlowPage.module.css';

const FlowPage = () => {
  const { flow } = useParams();
  const history = useHistory();
  const location = useLocation();
  const { oktaAuth } = useOktaAuth();
  const { transaction, setTransaction } = useIdxTransaction();

  const startFlow = useCallback(async () => {
    const queryParams = new URLSearchParams(location.search);
    const maxAge = queryParams.get('maxAge');
    const acrValues = queryParams.get('acrValues');
    const idxStartOptions = {
      ...(maxAge && { maxAge }),
      ...(acrValues && { acrValues }),
    };

    let newTransaction;
    if (flow === 'authenticate') {
      newTransaction = await oktaAuth.idx.authenticate(idxStartOptions);
    } else if (flow === 'register') {
      newTransaction = await oktaAuth.idx.register();
    } else if (flow === 'recoverPassword') {
      newTransaction = await oktaAuth.idx.register();
    } else if (flow === 'unlockAccount') {
      newTransaction = await oktaAuth.idx.unlockAccount();
    } else {
      newTransaction = await oktaAuth.idx.start(idxStartOptions);
    }
    setTransaction(newTransaction);
  }, [oktaAuth, flow, setTransaction, location.search]);

  useEffect(() => {
    // start a new flow based on path param, `/flow/${flowMethod}`
    if (flow && !transaction) { 
      startFlow();
    }
  }, [flow, transaction, startFlow]);

  const backToHomePage = async () => {
    // clear `flow` param to break the transaction update loop
    history.replace('/');

    await oktaAuth.idx.cancel();
    setTransaction(null);
  };

  const getFormComponent = () => {
    if (flow === 'idp') {
      return IdpForm;
    }
    return GeneralForm;
  };

  const FormComponent = getFormComponent();
  return (
    <Box 
      className={classes.container} 
      display="flex" 
      flexDirection="column"
      justifyContent="flex-start" 
      backgroundColor="disabled"
    >
      <Box className={classes.nav} display="flex" alignItems="center">
        <Box padding="m">
          <Link onClick={backToHomePage}>Home</Link>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center">
        <Box className={classes.formContainer} backgroundColor="default">
          <FormComponent />
        </Box>
      </Box>
    </Box>
  );
};

export default FlowPage;
