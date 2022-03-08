import { useState, useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Box, Text } from '@okta/odyssey-react';
import InfoBox from '../InfoBox';
import Spinner from '../Spinner';
import AddAttributeButton from '../AddAttributeButton';
import RemoveButton from '../RemoveAttributeButton';
import { 
  addEmail, 
  addPhone, 
  deleteEmail, 
  deletePhone, 
  getEmails, 
  getPhones 
} from '../../api/MyAccountAPI';
import { useTransaction } from '../../TransactionContext';

const IdentifiersSection = () => {
  const { oktaAuth } = useOktaAuth();
  const { setMyAccountTransaction } = useTransaction();
  const [emails, setEmails] = useState();
  const [phones, setPhones] = useState();

  useEffect(() => {
    const fetchEmails = async () => {
      const emails = await getEmails(oktaAuth);
      setEmails(emails.map(email => {
        if (email.roles.includes('PRIMARY')) {
          email.label = 'Primary email';
        } else {
          email.label = 'Secondary email'
        }
        return email;
      }));
    };
    if (!emails) {
      fetchEmails();
    }
  }, [emails]);

  useEffect(() => {
    const fetchPhones = async () => {
      const phones = await getPhones(oktaAuth);
      setPhones(phones);
    };
    if (!phones) {
      fetchPhones();
    }
  }, [phones]);

  const finishEmailTransaction = () => {
    // re-fetch phones list
    setEmails(null);
    setMyAccountTransaction(null);
  };

  const finishPhoneTransaction = () => {
    // re-fetch phones list
    setPhones(null);
    setMyAccountTransaction(null);
  };

  const startUpdatePrimaryEmailTransaction = async (email) => {
    let transaction = await addEmail(oktaAuth, {
      profile: {
        email
      },
      sendEmail: false, // true returns 403
      role: 'PRIMARY'
    });
    transaction = await transaction.challenge();
    setMyAccountTransaction(transaction);
  };

  const startAddSecondaryEmailTransaction = async (email) => {
    let transaction = await addEmail(oktaAuth, {
      profile: {
        email
      },
      sendEmail: false, // true returns 403
      role: 'SECONDARY'
    });
    transaction = await transaction.challenge();
    setMyAccountTransaction(transaction);
  };

  const handleRemoveEmail = async (emailId) => {
    await deleteEmail(oktaAuth, emailId);
    finishEmailTransaction();
  };

  const startAddPhoneTransaction = async phone => {
    const transaction = await addPhone(oktaAuth, phone);
    setMyAccountTransaction(transaction);
  };

  const handleRemovePhone = async (phoneId) => {
    await deletePhone(oktaAuth, phoneId);
    finishPhoneTransaction();
  };

  const startEmailVerificationTransaction = async (email) => {
    const transaction = await email.challenge();
    setMyAccountTransaction(transaction);
  };

  const startPhoneVerificationTransaction = async (phone) => {
    await phone.challenge({ data: { method: 'SMS' } }); // no response
    setMyAccountTransaction(phone);
  };

  return (
    <Box display="flex" className="pure-g">
      <Box 
        className="pure-u-1 pure-u-sm-1-2" 
        paddingRight="s" 
        display="flex" 
        flexDirection="column"
      >
        {!!emails ? (
          <Box>
            {emails.map(email => (
              <Box key={email.id} display="flex" flexDirection="column">
                <Box display="flex" alignItems="center" justifyContent="flex-start">
                  <Text as="strong">{email.label}</Text>
                  <Box marginLeft="s">
                    <AddAttributeButton 
                      heading="Verify Email"
                      inputLabel="Email"
                      onStartTransaction={startUpdatePrimaryEmailTransaction} 
                      onFinishTransaction={finishEmailTransaction}
                    >
                      Edit
                    </AddAttributeButton>
                  </Box>
                  {email.status === 'UNVERIFIED' && (
                    <Box marginLeft="s">
                      <AddAttributeButton 
                        heading="Verify Email"
                        inputLabel="Verification Code"
                        onClick={startEmailVerificationTransaction.bind(null, email)} 
                        onFinishTransaction={finishEmailTransaction}
                      >
                        Verify
                      </AddAttributeButton>
                    </Box>
                  )}
                  {email.roles.includes('SECONDARY') && (
                    <Box marginLeft="s">
                      <RemoveButton 
                        heading="Are you sure you want to remove this email?" 
                        description={phone.profile.email}
                        onConfirm={handleRemoveEmail.bind(null, email.id)}
                      >
                        Remove
                      </RemoveButton>
                    </Box>
                  )}
                </Box>
                <Text>{email.profile.email}</Text>
              </Box>
            ))}
            {!emails.some(email => email.roles.includes('SECONDARY')) && (
              <AddAttributeButton 
                heading="Add secondary email" 
                inputLabel="Email"
                onStartTransaction={startAddSecondaryEmailTransaction} 
                onFinishTransaction={finishEmailTransaction}
              >
                Add Secondary Email
              </AddAttributeButton>
            )}
          </Box>
        ) : (
          <Spinner />
        )}
        <Box>
          <Text as="strong">Phone number</Text>
          {!!phones ? phones.map(phone => (
            <Box key={phone.id} display="flex" alignItems="center">
              <Text>{phone.profile.phoneNumber}</Text>
              {phone.status === 'UNVERIFIED' && (
                <Box marginLeft="s">
                  <AddAttributeButton 
                    heading="Verify Phone Number"
                    inputLabel="Verification Code"
                    onClick={startPhoneVerificationTransaction.bind(null, phone)} 
                    onFinishTransaction={finishPhoneTransaction}
                  >
                    Verify
                  </AddAttributeButton>
                </Box>
              )}
              <Box marginLeft="s">
                <RemoveButton 
                  heading="Are you sure you want to remove this phone number?" 
                  description={phone.profile.phoneNumber}
                  onConfirm={handleRemovePhone.bind(null, phone.id)}
                >
                  Remove
                </RemoveButton>
              </Box>
            </Box>
          )) : (
            <Spinner />
          )}
          <AddAttributeButton 
            heading="Add Phone Number"
            inputLabel="Phone Number"
            onStartTransaction={startAddPhoneTransaction} 
            onFinishTransaction={finishPhoneTransaction}
          >
            Add phone number
          </AddAttributeButton>
        </Box>
      </Box>
      <Box className="pure-u-1 pure-u-sm-1-2">
        <InfoBox 
          heading="Tip" 
          icon="information-circle-filled" 
          renderInfo={() => (
            <Text as="p">User identifiers are separated because changes require verification.</Text>
          )} 
        />
      </Box>
    </Box>
  );
};

export default IdentifiersSection;
