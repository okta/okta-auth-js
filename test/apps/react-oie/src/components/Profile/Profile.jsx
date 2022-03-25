import { Box } from '@okta/odyssey-react';
import ProfileSection from './ProfileSection';
import IdentifiersSection from './IdentifiersSection';

const Profile = () => {
  return (
    <Box id="profile-table" padding="s" borderColor="display" borderRadius="base">
      <ProfileSection />
      <Box borderColor="display" />
      <IdentifiersSection />
    </Box>
  );
};

export default Profile;
