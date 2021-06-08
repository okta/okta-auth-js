import ChallengeAuthenticator from '../../selectors/ChallengeAuthenticator';
import a18nClient from '../../management-api/a18nClient';
import setInputField from '../setInputField';
import ActionContext from '../../context';

export default async function (this: ActionContext) {
  const code = await a18nClient.getSMSCode(this.credentials.profileId);
  await setInputField('set', code, ChallengeAuthenticator.code);
}
