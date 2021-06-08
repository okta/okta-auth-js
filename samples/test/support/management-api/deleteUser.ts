
import { User } from '@okta/okta-sdk-nodejs';

export default async function(user: User): Promise<void> {
  await user.deactivate();
  await user.delete();
}
