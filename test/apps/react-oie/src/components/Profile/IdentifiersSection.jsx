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

const IdentifiersSection = () => {
  const { oktaAuth } = useOktaAuth();
  const [emails, setEmails] = useState();
  const [phones, setPhones] = useState();

  useEffect(() => {
    const fetchEmails = async () => {
      const emails = await getEmails(oktaAuth);
      setEmails(emails.map(email => {
        if (email.roles.includes('PRIMARY')) {
          email.label = 'Primary email';
        } else {
          email.label = 'Secondary email';
        }
        return email;
      }));
    };
    if (!emails) {
      fetchEmails();
    }
  }, [oktaAuth, emails]);

  useEffect(() => {
    const fetchPhones = async () => {
      const phones = await getPhones(oktaAuth);
      setPhones(phones);
    };
    if (!phones) {
      fetchPhones();
    }
  }, [oktaAuth, phones]);

  const finishEmailTransaction = () => {
    // re-fetch phones list
    setEmails(null);
  };

  const finishPhoneTransaction = () => {
    // re-fetch phones list
    setPhones(null);
  };

  const startUpdateEmailTransaction = async (emailObj, email) => {
    return addEmail(oktaAuth, {
      profile: {
        email: email
      },
      sendEmail: true,
      role: emailObj.roles[0]
    });
  };

  const startAddSecondaryEmailTransaction = async (email) => {
    return addEmail(oktaAuth, {
      profile: {
        email
      },
      sendEmail: true,
      role: 'SECONDARY'
    });
  };

  const handleRemoveEmail = async (emailId) => {
    await deleteEmail(oktaAuth, emailId);
  };

  const startAddPhoneTransaction = async phone => {
    return addPhone(oktaAuth, phone);
  };

  const handleRemovePhone = async (phoneId) => {
    await deletePhone(oktaAuth, phoneId);
  };

  const startEmailVerificationTransaction = async (email) => {
    return email.challenge();
  };

  const startPhoneVerificationTransaction = async (phone) => {
    await phone.challenge({ data: { method: 'SMS' } }); // no response
    return phone;
  };

  return (
    <Box display="flex" className="pure-g">
      <Box 
        className="pure-u-1 pure-u-sm-1-2" 
        paddingRight="s" 
        display="flex" 
        flexDirection="column"
      >
        {emails ? (
          <Box>
            {emails.map(email => (
              <Box key={email.id} display="flex" flexDirection="column" paddingBottom="s">
                <Box display="flex" alignItems="center" justifyContent="flex-start">
                  <Text as="strong">{email.label}</Text>
                  {email.status === 'VERIFIED' ? (
                    <Box marginLeft="s">
                      <AddAttributeButton 
                        heading="Edit Email"
                        initInputLabel="Email"
                        onStartTransaction={startUpdateEmailTransaction.bind(null, email)} 
                        onFinishTransaction={finishEmailTransaction}
                      >
                        Edit
                      </AddAttributeButton>
                    </Box>
                  ) : (
                    <>
                    <Box marginLeft="s">
                      <AddAttributeButton 
                        heading="Verify Email"
                        initInputLabel="Verification Code"
                        autoStartTransaction
                        onStartTransaction={startEmailVerificationTransaction.bind(null, email)} 
                        onFinishTransaction={finishEmailTransaction}
                      >
                        Verify
                      </AddAttributeButton>
                    </Box>
                    <Box marginLeft="s">
                      <RemoveButton 
                        heading="Are you sure you want to remove this email?" 
                        description={email.profile.email}
                        onStartTransaction={handleRemoveEmail.bind(null, email.id)}
                        onFinishTransaction={finishEmailTransaction}
                      >
                        Remove
                      </RemoveButton>
                    </Box>
                    </>
                  )}
                </Box>
                <Box paddingTop="s">
                  <Text>{email.profile.email}</Text>
                </Box>
              </Box>
            ))}
            {!emails.some(email => email.roles.includes('SECONDARY')) && (
              <AddAttributeButton 
                heading="Add secondary email" 
                initInputLabel="Email"
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
          {phones ? phones.map(phone => (
            <Box key={phone.id} display="flex" alignItems="center" paddingTop="s">
              <Box>
                <Text>{phone.profile.phoneNumber}</Text>
              </Box>
              {phone.status === 'UNVERIFIED' && (
                <Box marginLeft="s">
                  <AddAttributeButton 
                    heading="Verify Phone Number"
                    initInputLabel="Verification Code"
                    autoStartTransaction
                    onStartTransaction={startPhoneVerificationTransaction.bind(null, phone)} 
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
                  onStartTransaction={handleRemovePhone.bind(null, phone.id)}
                  onFinishTransaction={finishPhoneTransaction}
                >
                  Remove
                </RemoveButton>
              </Box>
            </Box>
          )) : (
            <Spinner />
          )}
          <Box paddingTop="s" paddingBottom="s">
            <AddAttributeButton 
              heading="Add Phone Number"
              initInputLabel="Phone Number"
              onStartTransaction={startAddPhoneTransaction} 
              onFinishTransaction={finishPhoneTransaction}
            >
              Add phone number
            </AddAttributeButton>
          </Box>
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
