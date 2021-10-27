import ActionContext from '../../context';
import deletePolicy from '../../management-api/deletePolicy';
import { POLICY_TYPE_PROFILE_ENROLLMENT } from '../../management-api/constants';

export default async function (this: ActionContext) {
  await deletePolicy(this.currentTestCaseId, POLICY_TYPE_PROFILE_ENROLLMENT);
}
