import Registration from '../../selectors/Registration';
import setInputField from '../setInputField';
import ActionContext from '../../context';

export default async function (this: ActionContext, fieldName: string) {
  let value, selector;
  switch (fieldName) {
    case 'First Name':
      value = this.credentials.firstName;
      selector = Registration.firstName;
      break;
    case 'Last Name':
      value = this.credentials.lastName;
      selector = Registration.lastName;
      break;
    case 'Email':
      value = this.credentials.emailAddress;
      selector = Registration.email;
      break;
    default: 
      throw new Error(`Unknown credential "${fieldName}"`);
  }
  await setInputField('set', value, selector);

}
