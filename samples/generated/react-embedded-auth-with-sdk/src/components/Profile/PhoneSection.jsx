import { useState, useEffect } from 'react';
import {
  addPhone,
  getPhones,
  verifyPhoneChallenge
} from '@okta/okta-auth-js/myaccount';
import { useOktaAuth } from '@okta/okta-react';
import { Box, Text } from '@okta/odyssey-react';
import Spinner from '../Spinner';
import TransactionModalButton from '../TransactionModalButton';
import { useMyAccountContext } from '../../contexts';

const PhoneSection = () => {
  const { oktaAuth } = useOktaAuth();
  const { setTransaction, setProfile } = useMyAccountContext();
  const [phones, setPhones] = useState();

  useEffect(() => {
    const fetchPhones = async () => {
      const phones = await getPhones(oktaAuth);
      setPhones(phones);
    };
    if (!phones) {
      fetchPhones();
    }
  }, [oktaAuth, phones]);

  const finishTransaction = () => {
    // re-fetch phones and profile
    setPhones(null);
    setProfile(null);
  };

  const handleAddPhone = async phoneNumber => {
    return addPhone(oktaAuth, {
      payload: {
        profile: {
          phoneNumber
        },
        sendCode: true,
        method: 'SMS'
      }
    });
  };

  const handleDeletePhone = async phone => {
    await phone.delete();
  };

  const handleSendChallengeCode = async phone => {
    setTransaction(phone);
    await phone.challenge({ method: 'SMS' });
  };

  const handleVerifyChallenge = async (code, phoneId) => {
    await verifyPhoneChallenge(oktaAuth, {
      id: phoneId,
      payload: { verificationCode: code }
    });
  };

  if (!phones) {
    return <Spinner />;
  }

  return (
    <Box id="phone-section">
      <Text as="strong">Phone number</Text>
      {phones.map(phone => (
        <Box key={phone.id} display="flex" alignItems="center" paddingTop="s">
          <Box className='phone-number'>
            <Text>{phone.profile.phoneNumber}</Text>
          </Box>
          {phone.status === 'UNVERIFIED' && (
            <Box marginLeft="s">
              <TransactionModalButton 
                buttonText="Verify"
                action="verify"
                factor="phone number"
                challengePayload={{method: 'SMS'}}
                autoStart
                onStart={handleSendChallengeCode.bind(null, phone)}
                onVerify={handleVerifyChallenge}
                onFinish={finishTransaction}
              />
            </Box>
          )}
          <Box marginLeft="s">
            <TransactionModalButton 
              buttonText="Remove"
              action="remove"
              factor="phone number"
              onStart={handleDeletePhone.bind(null, phone)}
              onFinish={finishTransaction}
            />
          </Box>
        </Box>
      ))}
      <Box paddingTop="s" paddingBottom="s">
        <TransactionModalButton
          buttonText="Add phone number"
          action="add"
          factor="phone number"
          challengePayload={{method: 'SMS'}}
          onStart={handleAddPhone}
          onVerify={handleVerifyChallenge}
          onFinish={finishTransaction} 
        />
      </Box>
    </Box>
  );
};

export default PhoneSection;
