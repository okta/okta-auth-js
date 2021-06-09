import clickElement from './clickElement';
import ActionContext from '../context';
import getLoginForm from '../lib/getLoginForm';

export default async function(this: ActionContext) {
  const loginForm = getLoginForm(this.featureName);
  const selector = loginForm.submit;
  await clickElement('click', 'selector', selector);
};
