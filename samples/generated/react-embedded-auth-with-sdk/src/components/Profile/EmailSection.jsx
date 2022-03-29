import { useState, useEffect } from 'react';
import {
  addEmail,
  getEmails,
  verifyEmailChallenge
} from '@okta/okta-auth-js/myaccount';
import { useOktaAuth } from '@okta/okta-react';
import { Box, Text } from '@okta/odyssey-react';
import Spinner from '../Spinner';
import TransactionModalButton from '../TransactionModalButton';
import { useMyAccountContext } from '../../contexts';
import { capitalizeFirstLetter } from '../../util';

const EmailSection = () => {
  const { oktaAuth } = useOktaAuth();
  const { setTransaction, setChallenge, setProfile } = useMyAccountContext();
  const [emails, setEmails] = useState();

  useEffect(() => {
    const fetchEmails = async () => {
      const emails = await getEmails(oktaAuth);
      setEmails(emails.map(email => {
        email.label = `${capitalizeFirstLetter(email.roles[0].toLowerCase())} email`;
        email.selectorId = email.label
          .split(' ')
          .map(str => str.toLowerCase())
          .join('-');
        return email;
      }));
    };
    if (!emails) {
      fetchEmails();
    }
  }, [oktaAuth, emails]);

  const finishTransaction = () => {
    // re-fetch emails and profile
    setEmails(null);
    setProfile(null);
  };

  const handleAddEmail = async (role, email) => {
    return addEmail(oktaAuth, {
      payload: {
        profile: {
          email
        },
        sendEmail: true,
        role
      }
    });
  };

  const handleDeleteEmail = async email => {
    await email.delete();
  };

  const handleSendChallengeCode = async (email) => {
    setTransaction(email);
    const transaction = await email.challenge();
    setChallenge(transaction);
  };

  const handleVerifyChallenge = async (code, emailId, challengeId) => {
    await verifyEmailChallenge(oktaAuth, {
      emailId,
      challengeId,
      payload: { verificationCode: code }
    });
  };

  if (!emails) {
    return <Spinner />;
  }

  return (
    <Box>
      {emails.map(email => {
        const factor = `${email.roles[0].toLowerCase()} email`;
        return (
          <Box key={email.id} display="flex" flexDirection="column" paddingBottom="s">
            <Box display="flex" alignItems="center" justifyContent="flex-start">
              <Text as="strong">{email.label}</Text>
              {email.status === 'VERIFIED' ? (
                <Box marginLeft="s">
                  <TransactionModalButton
                    buttonText="Edit"
                    action="edit"
                    factor={factor}
                    onStart={handleAddEmail.bind(null, email.roles[0])}
                    onFinish={finishTransaction}
                  />
                </Box>
              ) : (
                <>
                  <Box marginLeft="s">
                    <TransactionModalButton
                      buttonText="Verify"
                      action="verify"
                      factor={factor}
                      autoStart
                      onStart={handleSendChallengeCode.bind(null, email)}
                      onVerify={handleVerifyChallenge}
                      onFinish={finishTransaction}
                    />
                  </Box>
                  <Box marginLeft="s">
                    <TransactionModalButton
                      buttonText="Remove"
                      action="remove"
                      factor={factor}
                      onStart={handleDeleteEmail.bind(null, email)}
                      onFinish={finishTransaction}
                    />
                  </Box>
                </>
              )}
            </Box>
            <Box paddingTop="s">
              <Text id={email.selectorId}>{email.profile.email}</Text>
            </Box>
          </Box>
        )
      })}
      {!emails.some(email => email.roles.includes('SECONDARY')) && (
        <TransactionModalButton
          buttonText="Add Secondary Email"
          action="add"
          factor="secondary email"
          onStart={handleAddEmail.bind(null, 'SECONDARY')}
          onFinish={finishTransaction}
        />
      )}
    </Box>
  );
};

export default EmailSection;
