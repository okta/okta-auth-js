import React from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Link, Box, Button, Text, Icon } from '@okta/odyssey-react';

import classes from './TopNav.module.css';

const TopNav = () => {
  const { oktaAuth, authState } = useOktaAuth();

  const handleLogoutOut = async () => {
    await oktaAuth.signOut();
  };

  return (
    <Box 
      className={classes.container}
      display="flex" 
      width="full" 
      backgroundColor="disabled" 
      justifyContent="space-between"
      alignItems="center"
    >
      <Box padding="m">
        <Text as="strong">Okta Sample</Text>
      </Box>
      <Box display="flex" alignItems="center" padding="m">
        <Box marginLeft="s">
          <Link>Docs <Icon name="external-link" /></Link>
        </Box>
        { authState?.isAuthenticated && (
          <Box marginLeft="s">
            <Button 
              variant="secondary" 
              onClick={handleLogoutOut}
            >
              Sign Out
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TopNav;
