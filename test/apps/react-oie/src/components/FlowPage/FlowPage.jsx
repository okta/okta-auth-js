import { useCallback, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { Box, Link } from '@okta/odyssey-react';
import { useTransaction } from '../../TransactionContext';
import GeneralForm from '../GeneralForm';
import IdpForm from '../IdpForm';

import classes from './FlowPage.module.css';

const FlowPage = () => {
  const { flow } = useParams();
  const history = useHistory();
  const { oktaAuth } = useOktaAuth();
  const { transaction, setTransaction } = useTransaction();

  const startFlow = useCallback(async () => {
    const newTransaction = flow === 'idp' 
      ? await oktaAuth.idx.startTransaction() 
      : await oktaAuth.idx[flow]();
    setTransaction(newTransaction);
  }, [oktaAuth]);

  useEffect(() => {
    // start a new flow based on path param, `/flow/${flowMethod}`
    if (flow && !transaction) { 
      startFlow();
    }
  }, [flow]);

  const backToHomePage = async () => {
    await oktaAuth.idx.cancel();
    setTransaction(null);
    history.replace('/');
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
        <Box backgroundColor="default">
          <FormComponent />
        </Box>
      </Box>
    </Box>
  );
}

export default FlowPage;
