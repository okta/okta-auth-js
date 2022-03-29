import { Box, Text } from '@okta/odyssey-react';
import ProfileSection from './ProfileSection';
import EmailSection from './EmailSection';
import PhoneSection from './PhoneSection';
import InfoBox from '../InfoBox';

const Profile = () => {
  return (
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
    </Box>
  );
};

export default Profile;
