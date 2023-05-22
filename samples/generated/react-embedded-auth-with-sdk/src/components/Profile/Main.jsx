import { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
import PasswordSection from './PasswordSection';
import InfoBox from '../InfoBox';
import { MyAccountContext, useIdxTransaction } from '../../contexts';

const Profile = () => {
  const history = useHistory();
  const { oktaAuth } = useOktaAuth();
  const { setTransaction: setIdxTransaction } = useIdxTransaction();
  const [error, setError] = useState(null);
  const [corsError, setCorsError] = useState(null);
  const [approach, setApproach] = useState('');
  const [profile, setProfile] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [challenge, setChallenge] = useState(null);

  const handleCancel = () => setError(null);

  const handleReAuthentication = useCallback(async (e) => {
    e.preventDefault();

    const accessToken = oktaAuth.getAccessToken();
    const idToken = oktaAuth.getIdToken();
    const scopes = decodeToken(accessToken).payload.scp;
    // Required for insufficient authentication scenario 
    const maxAge = +error.meta.max_age;
    const acrValues = error.meta.acr_values;

    if (approach === 'authorize') {
      // Re-auth with Okta-hosted login flow
      await getWithRedirect(
        oktaAuth,
        {
          prompt: 'login',
          maxAge,
          acrValues,
          scopes,
          extraParams: {
            id_token_hint: idToken
          }
        }
      );
    } else if (approach === 'interact-sdk') {
      // App will be redirected to FlowPage (/flow) once IdxTransaction is updated
      const idxTransaction = await oktaAuth.idx.authenticate({ maxAge, acrValues });
      setIdxTransaction(idxTransaction);
    } else if (approach === 'interact-widget') {

      const queryParams = new URLSearchParams({
        maxAge
      });
      if (acrValues) {
        queryParams.append('acrValues', acrValues);
      }
      history.replace(`/widget?${queryParams.toString()}`);
    }
  }, [oktaAuth, approach, error, setIdxTransaction, history]);

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
      startReAuthentication,
      corsError,
      setCorsError
    }}>
      <Box id="profile-table" padding="s" borderColor="display" borderRadius="base">
        <MyAccountPanel corsError={corsError}/>
        {
          !!error && <Modal open={true} id={`insufficientAuthentication-modal`} >
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
                    label="Re-Authenticate with Okta Hosted Login flow"
                    value="authorize"
                  />
                  <Radio.Button
                    label="Re-Authenticate with Embedded SDK"
                    value="interact-sdk"
                  />
                  <Radio.Button
                    label="Re-Authenticate with Embedded Widget"
                    value="interact-widget"
                  />
                </Radio.Group>
              </Form.Main>
              <Form.Actions>
                <Button variant="clear" name="cancel" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" name="confirm" onClick={handleReAuthentication}>
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

const MyAccountPanel = ({corsError}) => {
  if (corsError) {
    return (<p>Your Okta Org does not have the MyAccount API enabled</p>)
  }

  return (
    <>
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
          <PasswordSection />
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
    </>
  );
}

export default Profile;
