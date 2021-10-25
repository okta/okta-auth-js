import { getConfig } from '../../../util/configUtils';
import ActionContext from '../../context';
import addAppToPolicy from '../../management-api/addAppToPolicy';
import addCustomProfileEnrollmentAttribute from '../../management-api/addCustomProfileEnrollmentAttribute';
import createPolicy from '../../management-api/createPolicy';

export default async function (this: ActionContext) {
  const { clientId } = getConfig();
  const policy = await createPolicy(`${this.currentTestCaseId} SSR With Custom attribute`, 'PROFILE_ENROLLMENT');
  await addCustomProfileEnrollmentAttribute(
    policy.id, {name: 'customAttribute', label: 'Custom Attribute', required: true});
  await addAppToPolicy(policy.id, clientId as string);
}
