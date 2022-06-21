import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@okta/okta-auth-js/myaccount';
import { useOktaAuth } from '@okta/okta-react';
import { 
  Box, 
  Heading, 
  Icon, 
  Button, 
  TextInput, 
  Infobox,
  Text,
} from '@okta/odyssey-react';
import InfoBox from '../InfoBox';
import Spinner from '../Spinner';
import { useMyAccountContext } from '../../contexts';

const ProfileSection = () => {
  const { oktaAuth } = useOktaAuth();
  const { profile, setProfile, startReAuthentication } = useMyAccountContext();
  const [inputs, setInputs] = useState([
    { label: 'Given name', name: 'firstName', type: 'text', value: '' },
    { label: 'Family name', name: 'lastName', type: 'text', value: '' },
    { label: 'Age', name: 'age', type: 'number', value: '' }
  ]);
  const [editing, setEditing] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (editing) {
      return;
    }
    const fetchProfile = async () => {
      const profile = await getProfile(oktaAuth);
      setProfile(profile.profile);
    };
    if (!profile) {
      fetchProfile();
    }
  }, [oktaAuth, editing, profile, setProfile]);

  const handleEditNames = () => {
    const newInputs = inputs.map(input => ({ ...input, value: profile[input.name] || '' }));
    setInputs(newInputs);
    setEditing(true);
    setUpdated(false);
    setError(null);
  };

  const handleCancelEditNames = () => {
    const newInputs = inputs.map(input => ({ ...input, value: '' }));
    setInputs(newInputs);
    setEditing(false);
  };

  const handleUpdateProfiles = async () => {
    const updatedProfile = inputs.reduce((acc, curr) => {
      if (curr.type === 'number') {
        const castedNumber = Number(curr.value);
        if (Number.isNaN(castedNumber)) {
          // assign invalid value for server side validation
          acc[curr.name] = curr.value;    
        } else {
          acc[curr.name] = castedNumber  
        }
      } else {
        acc[curr.name] = curr.value;
      }
      return acc;
    }, profile);

    try {
      const newProfile = await updateProfile(oktaAuth, {
        payload: {
          profile: updatedProfile
        }
      });
      setProfile(newProfile.profile);
      setUpdated(true);
    } catch (err) {
      if (err.errorSummary === 'insufficient_authentication_context') {
        startReAuthentication(err);
      } else {
        setError(err);
      }
      setProfile(null);
    }
    
    handleCancelEditNames();
  };

  const handleChange = ({ target: { name, value } }) => {
    const newInputs = inputs.map(input => {
      if (input.name === name) {
        input.value = value;
      }
      return input;
    });
    setInputs(newInputs);
  };

  if (!profile) {
    return <Spinner />;
  }

  return (
    <Box padding="m">
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        marginTop="s" 
        marginBottom="s"
      >
        <Heading level="1">
          <Icon name="user" />
          Your Profile
        </Heading>
        { editing ? (
          <Box display="flex" alignItems="center">
            <Button variant="clear" onClick={handleCancelEditNames}>Cancel</Button>
            <Button name="saveProfile" onClick={handleUpdateProfiles}>Save</Button>
          </Box>
        ) : (
          <Button name="editProfile" variant="secondary" onClick={handleEditNames}>Edit</Button>
        )}
      </Box>

      {!!(updated || error) && (
        <Box id="profile-messages-container" marginTop="s" marginBottom="s">
          {updated && (
            <Infobox 
              variant="success"
              content="The profile was updated successfully" />
          )}
          {!!error && (
            <Infobox 
            key={error.errorSummary}
            variant="danger"
            content={error.errorSummary} />
          )}
        </Box>
      )}

      <Box display="flex" className="pure-g">
        <Box className="pure-u-1 pure-u-sm-1-2" paddingRight="s">
          {inputs.map(({ label, name, value }) => (
            <Box key={name} paddingBottom="s">
              <TextInput 
                disabled={!editing}
                label={label} 
                name={name} 
                value={editing ? value : (profile[name] || '')} 
                onChange={handleChange}
              />
            </Box>
          ))}
        </Box>
        <Box className="pure-u-1 pure-u-sm-1-2">
          <InfoBox 
            id="profile-tip"
            heading="Tip" 
            icon="information-circle-filled" 
            renderInfo={() => (
              <Text as="p">
                The profile attributes in this example are driven by the Profile Enrollment policy.
              </Text>
            )} 
          />
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileSection;
