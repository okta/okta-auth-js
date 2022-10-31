import { useState, useEffect } from 'react';
import {
  getPassword,
  enrollPassword,
  updatePassword,
  deletePassword
} from '@okta/okta-auth-js/myaccount';
import { useOktaAuth } from '@okta/okta-react';
import { Box, Text } from '@okta/odyssey-react';
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
          newPassword
        }
      }
    });
  };

  const handleUpdatePassword = async (newPassword, currentPassword) => {
    return enrollPassword(oktaAuth, {
      payload: {
        profile: {
          newPassword,
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
      <Box display="flex" alignItems="center" paddingTop="s">
          {/* <Box className='password'>
            <Text>{password.profile.password}</Text>
          </Box> */}
          <Box marginLeft="s">
            <TransactionModalButton 
              buttonText="Remove"
              action="remove"
              factor="phone number"
              onStart={handleDeletePassword.bind(null, password)}
              onFinish={finishTransaction}
            />
          </Box>
        </Box>
      {/* <Box paddingTop="s" paddingBottom="s">
        <TransactionModalButton
          buttonText="Add phone number"
          action="add"
          factor="phone number"
          challengePayload={{method: 'SMS'}}
          onStart={handleAddPhone}
          onVerify={handleVerifyChallenge}
          onFinish={finishTransaction} 
        />
      </Box> */}
    </Box>
  );
};

export default PasswordSection;
