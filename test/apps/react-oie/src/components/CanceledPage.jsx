import { Heading, Button } from '@okta/odyssey-react';
import { useHistory } from 'react-router-dom';
import { useTransaction } from '../TransactionContext';

export default function() {
  const history = useHistory();
  const { setTransaction } = useTransaction();

  const handleRestart = () => {
    setTransaction(null);
    history.replace('/');
  };

  return (
    <>
      <Heading level="1">Transaction has been canceled!</Heading>
      <Button onClick={handleRestart}>Restart</Button>
    </>
  );
}
