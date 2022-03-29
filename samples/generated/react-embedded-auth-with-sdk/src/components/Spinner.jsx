import { Box, CircularLoadIndicator } from '@okta/odyssey-react';

const Spinner = () => (
  <Box display="flex" alignItems="center" justifyContent="center">
    <CircularLoadIndicator aria-label="Loader" aria-valuetext="Loading..." />
  </Box>
);

export default Spinner;
