import { User } from '@okta/okta-sdk-nodejs';
import {UserCredentials} from './management-api/createCredentials';

interface ActionContext {
  credentials: UserCredentials;
  user: User;
  featureName: string;
}

export default ActionContext;
