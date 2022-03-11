import { Box, Link } from '@okta/odyssey-react';

import classes from './LinkButton.module.css';

const LinkButton = (props) => {
  return (
    <Box className={classes.container}>
      <Link {...props} />
    </Box>
  );
};

export default LinkButton;
