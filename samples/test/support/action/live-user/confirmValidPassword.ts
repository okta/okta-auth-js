import setInputField from '../setInputField';

export default async function () {
  await setInputField('set', this.credentials.password, '#confirm-password');
}
