import ChallengeAuthenticator from '../selectors/ChallengeAuthenticator';
import setInputField from './setInputField';
import clickElement from './clickElement';

export default async function () {
  const code = '!incorrect!';
  await setInputField('set', code, ChallengeAuthenticator.code);
  await clickElement('click', 'selector', ChallengeAuthenticator.submit);
}