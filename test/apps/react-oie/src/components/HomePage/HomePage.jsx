import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { Box, Heading, Text, List, Button, Infobox } from '@okta/odyssey-react';
import TopNav from '../TopNav';
import Profile from '../Profile';
import InfoBox from '../InfoBox';

import classes from './HomePage.module.css';

export default function Home() {
  const history = useHistory();
  const { oktaAuth, authState } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!authState?.isAuthenticated) {
      setUserInfo(null);
    } else {
      oktaAuth.getUser().then((info) => {
        setUserInfo(info);
      }).catch((err) => {
        console.error(err);
      });
    }
  }, [authState, oktaAuth]);

  const startIdxFlow = flowMethod => async () => {
    const path = flowMethod ? `/${flowMethod}` : '';
    history.replace(`/flow${path}`);
  };

  return (
    <>
      <TopNav />
      <Box className={classes.homePageContainer} margin="l" display="flex" flexDirection="column">
        <Heading level="1">Welcome {userInfo && userInfo.name}</Heading>
        { authState?.isAuthenticated && <Infobox id="sign-in-info-box" heading="You're signed in" variant="success" /> }
        <Box display="flex" className="pure-g">
          <Box paddingRight="s" className="pure-u-1 pure-u-md-1-2">
            <InfoBox 
              heading="OAuth" 
              icon="settings" 
              renderInfo={() => (
                <>
                {!authState?.isAuthenticated && <Text className={classes.noToken}>No tokens yet</Text>}
                {authState?.idToken && <Text as="p">Id Token: {authState.idToken.idToken}</Text>}
                {authState?.accessToken && <Text as="p">Access Token: {authState.accessToken.accessToken}</Text>}
                {authState?.refreshToken && <Text as="p">Refresh Token: {authState.refreshToken.refreshToken}</Text>}
                </>
              )}/>
            <Box margin="s">
              <Text as="p">Congrats on starting this sample application! This sample will demostrate how to build views that facilitate some common authentication flows:</Text>
              <List>
                <List.Item>Sign In</List.Item>
                <List.Item>Sign Up</List.Item>
                <List.Item>Password Recovery</List.Item>
                <List.Item>Logout</List.Item>
              </List>
              <Text as="p">To learn more about enabling advanced authentication use cases in this application, check out our guide.</Text>
            </Box>
            { !authState?.isAuthenticated && (
              <Box marginTop="s">
                <Text>Give it a try:</Text>
                <Box display="flex" margin="s">
                  <Button name="signin" variant="primary" onClick={startIdxFlow('default')}>Sign In</Button>
                  <Button name="signup" variant="secondary" onClick={startIdxFlow('register')}>Sign Up</Button>
                </Box>
              </Box>
            )}
          </Box>
          { authState?.isAuthenticated && <Box paddingLeft="s" className="pure-u-1 pure-u-md-1-2"><Profile /></Box> }
        </Box>
      </Box>
    </>
  );
}
