/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


export * from './types';

import LoginForm from './LoginForm';
import Nav from './Nav';
import OktaSignInV1 from './OktaSignInV1';
import OktaSignInOIE from './OktaSignInOIE';
import Unauth from './Unauth';
import UserHome from './UserHome';
import PasswordRecover from './PasswordRecover';
import SelectAuthenticator from './SelectAuthenticator';
import PasswordReset from './PasswordReset';
import Home from './Home';
import { Page } from './Page';
import VerifyPhone from './VerifyPhone';
import EnrollGoogleAuthenticator from './EnrollGoogleAuthenticator';
import ChallengeEmailAuthenticator from './ChallengeEmailAuthenticator';
import EnrollPhoneAuthenticator from './EnrollPhoneAuthenticator';
import EnrollEmailAuthenticator from './EnrollEmailAuthenticator';
import ChallengePhoneAuthenticator from './ChallengePhoneAuthenticator';
import ChallengeSecurityQuestion from './ChallengeSecurityQuestion';
import ChallengeGoogleAuthenticator from './ChallengeGoogleAuthenticator';
import PasswordSetup from './PasswordSetup';
import Registration from './Registration';
import OktaSignInOIEFacebookIdp from './OktaSignInOIEFacebookIdp';
import OktaSignInOIEOktaIdp from './OktaSignInOIEOktaIdp';

const pages: { [key: string]: Page } = {
  'Login View': LoginForm,
  'Basic Login View': LoginForm,
  'Login with Username and Password': LoginForm,
  'Basic Social Login View': LoginForm,
  'Self Service Registration View': Registration,
  'Self Service Password Reset View': PasswordRecover,
  'Select authenticator': SelectAuthenticator,
  'Enter Code': ChallengeEmailAuthenticator,
  'Challenge email authenticator': ChallengeEmailAuthenticator,
  'Enroll Factor: Enter SMS Code': EnrollPhoneAuthenticator,
  'Reset Password': PasswordReset,
  'Root Page': Home,
  'Root View': Home,
  'Set up Password': PasswordSetup,
  'Enroll email authenticator': EnrollEmailAuthenticator,
  'Verify using phone authenticator': VerifyPhone,
  'Challenge phone authenticator': ChallengePhoneAuthenticator,
  'Challenge Security Question': ChallengeSecurityQuestion,
  'Enroll Google Authenticator':  EnrollGoogleAuthenticator,
  'Challenge Google Authenticator':  ChallengeGoogleAuthenticator,
  // SIW form
  'Embedded Widget View': OktaSignInOIE,
  'Login with Social IDP': OktaSignInOIEFacebookIdp,
  'Login with Okta OIDC IDP': OktaSignInOIEOktaIdp,
};


export {
  LoginForm,
  Nav,
  OktaSignInV1,
  OktaSignInOIE,
  Unauth,
  UserHome,
  pages
};
