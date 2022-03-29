import { useCallback, useState } from 'react';
import { getWithRedirect, decodeToken } from '@okta/okta-auth-js';
import { useOktaAuth } from '@okta/okta-react';
import {
  Box,
  Text,
  Modal,
  Radio,
  Form,
  Button
} from '@okta/odyssey-react';
import ProfileSection from './ProfileSection';
import EmailSection from './EmailSection';
import PhoneSection from './PhoneSection';
import InfoBox from '../InfoBox';
import { MyAccountContext, useIdxTransaction } from '../../contexts';

const Profile = () => {
  const { oktaAuth } = useOktaAuth();
  const { setTransaction: setIdxTransaction } = useIdxTransaction();
  const [error, setError] = useState(null);
  const [approach, setApproach] = useState('');
  const [profile, setProfile] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [challenge, setChallenge] = useState(null);

  const handleCancel = () => setError(null);

  const handleReAuth = useCallback(async (e) => {
    e.preventDefault();

    const accessToken = oktaAuth.getAccessToken();
    const idToken = oktaAuth.getIdToken();
    const scopes = decodeToken(accessToken).payload.scp;

    if (approach === 'authorize') {
      // Re-auth with Okta-hosted login flow
      await getWithRedirect(
        oktaAuth,
        {
          prompt: 'login',
          maxAge: +error.max_age, // Required for insufficient authentication scenario
          scopes,
          extraParams: {
            id_token_hint: idToken
          }
        }
      );
    } else if (approach === 'interact') {
      // App will be redirected to FlowPage (/flow) once IdxTransaction is updated
      const idxTransaction = await oktaAuth.idx.authenticate({ 
        maxAge: error.meta.max_age // Required for insufficient authentication scenario
      });
      setIdxTransaction(idxTransaction);
    }
  }, [oktaAuth, approach, error, setIdxTransaction]);

  const handleApproachChange = event => {
    setApproach(event.target.value);
  };

  const startReAuthentication = (err) => {
    setError(err);
  };

  return (
    <MyAccountContext.Provider value={{
      profile,
      setProfile,
      transaction,
      setTransaction,
      challenge,
      setChallenge,
      startReAuthentication
    }}>
      <Box id="profile-table" padding="s" borderColor="display" borderRadius="base">
        <ProfileSection />

        <Box borderColor="display" />

        <Box display="flex" className="pure-g" padding="m">
          <Box
            className="pure-u-1 pure-u-sm-1-2"
            paddingRight="s"
            display="flex"
            flexDirection="column"
            marginTop="s"
          >
            <EmailSection />
            <PhoneSection />
          </Box>

          <Box className="pure-u-1 pure-u-sm-1-2" marginTop="s">
            <InfoBox
              id="identifiers-tip"
              heading="Tip"
              icon="information-circle-filled"
              renderInfo={() => (
                <Text as="p">
                  User identifiers are separated because changes require verification.
                </Text>
              )}
            />
          </Box>
        </Box>

        {
          !!error && <Modal open={true}>
            <Form
              heading="Insufficient Authentication"
              desc={error.errorCauses[0]?.errorSummary}
            >
              <Form.Main>
                <Radio.Group
                  hint="Select the approch to re-authenticate:"
                  label="Approaches"
                  name="approach"
                  onChange={handleApproachChange}
                >
                  <Radio.Button
                    label="Okta Hosted Re-Auth"
                    value="authorize"
                  />
                  <Radio.Button
                    label="Embedded Re-Auth"
                    value="interact"
                  />
                </Radio.Group>
              </Form.Main>
              <Form.Actions>
                <Button variant="clear" name="cancel" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" name="confirm" onClick={handleReAuth}>
                  Confirm
                </Button>
              </Form.Actions>
            </Form>
          </Modal>
        }

      </Box>
    </MyAccountContext.Provider>
  );
};

export default Profile;
