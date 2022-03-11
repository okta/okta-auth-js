import { Box, Heading, Icon } from '@okta/odyssey-react';

import classes from './InfoBox.module.css';

const InfoBox = ({ heading, icon, renderInfo }) => {
  
  return (
    <Box 
      className={classes.container}
      display="flex" 
      paddings="s" 
      flexDirection="column"
      borderRadius="base"
      padding="m"
    >
      <Heading level="1"><Icon name={icon} />{heading}</Heading>
      <Box className={classes.infoContainer}>
        { renderInfo() }
      </Box>
    </Box>
  );
};

export default InfoBox;
