import ActionContext from '../../context';
import deletePolicy from '../../management-api/deletePolicy';

export default async function (this: ActionContext) {
  if (this.useProfileEnrollPolicy) {
    await deletePolicy(this.currentTestCaseId, 'PROFILE_ENROLLMENT');
  }
}
