import React, { useState, useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Box, Heading, Icon, Button, TextInput, Text } from '@okta/odyssey-react';
import InfoBox from '../InfoBox';
import Spinner from '../Spinner';
import { getProfile, updateProfile } from '../../api/MyAccountAPI';

const ProfileSection = () => {
  const { oktaAuth } = useOktaAuth();
  const [profile, setProfile] = useState(null);
  const [inputs, setInputs] = useState([
    { label: 'Given name', name: 'firstName' },
    { label: 'Family name', name: 'lastName' }
  ]);

  useEffect(() => {
    getProfile(oktaAuth).then(({ profile }) => {
      setProfile(profile);
    }).catch((err) => {
      console.error(err);
    });
  }, []);

  const handleEditNames = () => {
    const newInputs = inputs.map(input => ({ ...input, editing: true, value: profile[input.name] }));
    setInputs(newInputs);
  }

  const handleCancelEditNames = () => {
    const newInputs = inputs.map(input => ({ ...input, editing: false, value: '' }));
    setInputs(newInputs);
  }

  const handleUpdateProfiles = async () => {
    const updatedProfile = inputs.reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, profile);
    const newProfile = await updateProfile(oktaAuth, updatedProfile);
    setProfile(newProfile.profile);
    handleCancelEditNames();
  };

  const handleChange = ({ target: { name, value } }) => {
    const newInputs = inputs.map(input => {
      if (input.name === name) {
        input.value = value;
      }
      return input;
    })
    setInputs(newInputs);
  };

  if (!profile) {
    return <Spinner />;
  }

  const editing = inputs.reduce((acc, curr) => acc || curr.editing, false);
  return (
    <Box>
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
            <Button onClick={handleUpdateProfiles}>Save</Button>
          </Box>
        ) : (
          <Button variant="secondary" onClick={handleEditNames}>Edit</Button>
        )}
      </Box>

      <Box  display="flex" className="pure-g">
        <Box className="pure-u-1 pure-u-sm-1-2" paddingRight="s">
          {inputs.map(({ label, name, value, editing }) => (
            <Box key={name} paddingBottom="s">
              <TextInput 
                type="text"
                disabled={!editing}
                label={label} 
                name={name} 
                value={editing ? value : profile[name]} 
                onChange={handleChange}
              />
            </Box>
          ))}
        </Box>
        <Box className="pure-u-1 pure-u-sm-1-2">
          <InfoBox 
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
