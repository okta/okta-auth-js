import { getConfig } from '../../../util/configUtils';
import ActionContext from '../../context';
import addAppToPolicy from '../../management-api/addAppToPolicy';
import addCustomProfileEnrollmentAttribute from '../../management-api/addCustomProfileEnrollmentAttribute';
import createPolicy from '../../management-api/createPolicy';
import { POLICY_TYPE_PROFILE_ENROLLMENT } from '../../management-api/constants';

export default async function (this: ActionContext) {
  const { clientId } = getConfig();
  const policy = await createPolicy(`${this.currentTestCaseId} SSR With Custom attribute`, POLICY_TYPE_PROFILE_ENROLLMENT);
  await addCustomProfileEnrollmentAttribute(
    policy.id, {name: 'customAttribute', label: 'Custom Attribute', required: true});
  await addAppToPolicy(policy.id, clientId as string);
}
