import { waitForPopup } from '../../util/browserUtils';
import { LoginForm } from '../selectors';
import clickElement from './clickElement';

export default async () => {
  await clickElement('click', 'selector', LoginForm.facebookButton);
};
