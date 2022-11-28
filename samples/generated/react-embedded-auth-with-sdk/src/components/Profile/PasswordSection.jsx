import { useState, useEffect } from 'react';
import {
  getPassword,
  enrollPassword,
  updatePassword,
  PasswordStatus
} from '@okta/okta-auth-js/myaccount';
import { useOktaAuth } from '@okta/okta-react';
import { Box, Text, Icon } from '@okta/odyssey-react';
import Spinner from '../Spinner';
import TransactionModalButton from '../TransactionModalButton';
import { useMyAccountContext } from '../../contexts';

const PasswordSection = () => {
  const { oktaAuth } = useOktaAuth();
  const { setProfile } = useMyAccountContext();
  const [password, setPassword] = useState();

  useEffect(() => {
    const fetchPassword = async () => {
      const password = await getPassword(oktaAuth);
      setPassword(password);
    };
    if (!password) {
      fetchPassword();
    }
  }, [oktaAuth, password]);

  const finishTransaction = () => {
    // re-fetch password and profile
    setPassword(null);
    setProfile(null);
  };

  const handleEnrollPassword = async newPassword => {
    return enrollPassword(oktaAuth, {
      payload: {
        profile: {
          password: newPassword
        }
      }
    });
  };

  const handleUpdatePassword = async (newPassword, currentPassword) => {
    return updatePassword(oktaAuth, {
      payload: {
        profile: {
          password: newPassword,
          ...(currentPassword && { currentPassword })   // optional param
        }
      }
    });
  };

  const handleDeletePassword = async password => {
    await password.delete();
  };

  if (!password) {
    return <Spinner />;
  }

  return (
    <Box id="password-section">
      <Text as="strong">Password</Text>
      {password.status === PasswordStatus.NOT_ENROLLED && (
        <Box display="flex" paddingTop="s">
          <TransactionModalButton 
            buttonText="Enroll"
            action="enroll"
            factor="password"
            onStart={handleEnrollPassword}
            onFinish={finishTransaction}
          />
        </Box>
      )}
      {password.status === PasswordStatus.ACTIVE && (
        <>
          <Box paddingTop="s">
            <Text>Active <Icon name="check-circle-filled"/></Text>
            <Box>
              <Text as="small">last updated on {new Date(password.lastUpdated).toLocaleString()}</Text>
            </Box>
          </Box>
          <Box display="flex" paddingTop="s">
            <Box display="inline-flex" paddingRight="xs">
              <TransactionModalButton 
                buttonText="Update"
                action="update"
                factor="password"
                onStart={handleUpdatePassword}
                onFinish={finishTransaction}
              />
            </Box>
            &#x2022;
            <Box display="inline-flex" paddingLeft="xs">
              <TransactionModalButton 
                buttonText="Remove"
                action="remove"
                factor="password"
                onStart={handleDeletePassword.bind(null, password)}
                onFinish={finishTransaction}
              />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default PasswordSection;
