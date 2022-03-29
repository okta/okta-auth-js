import { Link, Box } from '@okta/odyssey-react';
import { useIdxTransaction } from '../contexts';

const IdpForm = () => {
  const { transaction: { availableSteps } } = useIdxTransaction();
  const idpMeta = availableSteps?.find(step => step.name === 'redirect-idp');

  return (
    <Box>
      <Box>Type: {idpMeta.type}</Box>
      <Link href={idpMeta.href}>Login With Google</Link>
    </Box>
  );
};

export default IdpForm;
