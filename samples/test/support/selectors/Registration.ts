const registrationForm = '#registration-form';
const firstName = `${registrationForm} #firstName`;
const lastName = `${registrationForm} #lastName`;
const email = `${registrationForm} #email`;
const submit = `${registrationForm} #submit-button`;
const formMessages = `#form-messages li`;
const formMessage = `${formMessages}:first-child`;

class RegistrationForm {
  get firstName() { return firstName; }
  get lastName() { return lastName; }
  get email() { return email; }
  get submit() { return submit; }
  get formMessage() { return formMessage; }
}

export default new RegistrationForm();
