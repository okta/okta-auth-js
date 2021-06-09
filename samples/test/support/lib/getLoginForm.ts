import LoginForm from '../selectors/LoginForm';
import OktaSignInOIE from '../selectors/OktaSignInOIE';

const getLoginForm = (featureName: string) => {
  switch (featureName) {
    case 'Basic Login with Embedded Sign In Widget':
      return OktaSignInOIE;
    default:
      return LoginForm;
  }
};

export default getLoginForm;
