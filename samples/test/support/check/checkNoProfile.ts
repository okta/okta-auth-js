import checkElementExists from './checkElementExists';
import UserHome from '../selectors/UserHome';

export default async () => {
  // verify no profile info
  await checkElementExists('no', UserHome.email);
};
