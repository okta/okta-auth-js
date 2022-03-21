import { getConfig } from '../../../../util/configUtils';
import ActionContext from '../../../context';
import addAppToPolicy from '../../../management-api/addAppToPolicy';
import fetchPolicy from '../../../management-api/fetchPolicy';

export default async function (this: ActionContext, policyName: string) {
  const { clientId } = getConfig();
  const policy = await fetchPolicy(policyName, 'PROFILE_ENROLLMENT');
  if (policy) {
    await addAppToPolicy(policy.id, clientId as string);
    this.useProfileEnrollPolicy = true;
  }
}
