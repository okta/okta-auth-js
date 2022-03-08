import { Link } from '@okta/odyssey-react';
import { useTransaction } from '../TransactionContext';

const IdpForm = () => {
  const { transaction: { availableSteps } } = useTransaction();
  const idpMeta = availableSteps?.find(step => step.name === 'redirect-idp');

  return (
    <Box>
      <Box>Type: {idpMeta.type}</Box>
      <Link href={idpMeta.href}>Login With Google</Link>
    </Box>
  )
};

export default IdpForm;
