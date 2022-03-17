import { getConfig } from '../../../../util/configUtils';
import ActionContext from '../../../context';
import addAppToPolicy from '../../../management-api/addAppToPolicy';
import fetchPolicy from '../../../management-api/fetchPolicy';

const PROPERTY_POLICY_MAP = {
  customAttribute: 'Custom Attribute Policy',
  age: 'Age Attribute Policy'
};

export default async function (this: ActionContext, propertyName: string) {
  const { clientId } = getConfig();
  const policy = await fetchPolicy((PROPERTY_POLICY_MAP as any)[propertyName], 'PROFILE_ENROLLMENT');
  if (policy) {
    await addAppToPolicy(policy.id, clientId as string);
    this.useProfileEnrollPolicy = true;
    this.customAttribute = propertyName;
  };
}
