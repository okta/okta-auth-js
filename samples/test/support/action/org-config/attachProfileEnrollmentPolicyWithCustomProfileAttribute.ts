import { getConfig } from '../../../util/configUtils';
import ActionContext from '../../context';
import addAppToPolicy from '../../management-api/addAppToPolicy';
import fetchPolicy from '../../management-api/fetchPolicy';

export default async function (this: ActionContext) {
  const { clientId } = getConfig();
  const policy = await fetchPolicy('Custom Attribute Policy', 'Okta:ProfileEnrollment');
  if (policy) {
    await addAppToPolicy(policy.id, clientId as string);
  }
}
