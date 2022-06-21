import { Heading, Button } from '@okta/odyssey-react';
import { useHistory } from 'react-router-dom';
import { useIdxTransaction } from '../contexts';

export default function CanceledPage() {
  const history = useHistory();
  const { setTransaction } = useIdxTransaction();

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
