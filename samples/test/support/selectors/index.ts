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
import SelectAuthenticatorMethod from './SelectAuthenticatorMethod';
import PasswordReset from './PasswordReset';
import Home from './Home';
import { Page } from './Page';
import VerifyEmail from './VerifyEmail';
import VerifyPhone from './VerifyPhone';
import EnrollGoogleAuthenticator from './EnrollGoogleAuthenticator';
import ChallengeEmailAuthenticator from './ChallengeEmailAuthenticator';
import ChallengePasswordAuthenticator from './ChallengePasswordAuthenticator';
import EnrollPhoneAuthenticator from './EnrollPhoneAuthenticator';
import EnrollEmailAuthenticator from './EnrollEmailAuthenticator';
import EnrollSecurityQuestion from './EnrollSecurityQuestion';
import ChallengePhoneAuthenticator from './ChallengePhoneAuthenticator';
import ChallengeSecurityQuestion from './ChallengeSecurityQuestion';
import ChallengeGoogleAuthenticator from './ChallengeGoogleAuthenticator';
import PasswordSetup from './PasswordSetup';
import Registration from './Registration';
import OktaSignInOIEFacebookIdp from './OktaSignInOIEFacebookIdp';
import OktaSignInOIEOktaIdp from './OktaSignInOIEOktaIdp';
import UnlockAccount from './UnlockAccount';
import SelectAuthenticatorUnlockAccount from './SelectAuthenticatorUnlockAccount';
import EnrollOktaVerifyAuthenticator from './EnrollOktaVerifyAuthenticator';
import SelectEnrollmentChannel from './SelectEnrollmentChannel';
import EnrollWebAuthn from './EnrollWebAuthn';
import SelectAuthenticatorAuthenticate from './SelectAuthenticatorAuthenticate';
import IdentifyForm from './IdentifyForm';
import MyAccountHome from './MyAccountHome';

const pages: { [key: string]: Page } = {
  'Login': LoginForm,
  'Login View': LoginForm,
  'Basic Login View': LoginForm,
  'Login with Username and Password': LoginForm,
  'Basic Social Login View': LoginForm,
  'Self Service Registration': Registration,
  'Self Service Registration View': Registration,
  'Self Service Password Reset View': PasswordRecover,
  'Self Service Password Reset': PasswordRecover,
  'Select Authenticator': SelectAuthenticator,
  'Select Authenticator Method': SelectAuthenticatorMethod,
  'Enter Code': ChallengeEmailAuthenticator,
  'Challenge email authenticator': ChallengeEmailAuthenticator,
  'Challenge Password Authenticator': ChallengePasswordAuthenticator,
  'Enroll Factor: Enter SMS Code': EnrollPhoneAuthenticator,
  'Enroll Phone Authenticator': EnrollPhoneAuthenticator,
  'Enroll security question authenticator': EnrollSecurityQuestion,
  'Reset Password': PasswordReset,
  'Root': Home,
  'Root Page': Home,
  'Root View': Home,
  'Set up Password': PasswordSetup,
  'Enroll email authenticator': EnrollEmailAuthenticator,
  'Verify Email': VerifyEmail,
  'Verify Phone': VerifyPhone,
  'Challenge phone authenticator': ChallengePhoneAuthenticator,
  'Challenge Security Question': ChallengeSecurityQuestion,
  'Enroll Google Authenticator':  EnrollGoogleAuthenticator,
  'Challenge Google Authenticator':  ChallengeGoogleAuthenticator,
  'Unlock Account': UnlockAccount,
  'Select Authenticator Unlock Account': SelectAuthenticatorUnlockAccount,
  'Enroll Okta Verify': EnrollOktaVerifyAuthenticator,
  'Select Enrollment Channel': SelectEnrollmentChannel,
  'Enroll WebAuthn': EnrollWebAuthn,
  // SIW form
  'Embedded Widget': OktaSignInOIE,
  'Login with Social IDP': OktaSignInOIEFacebookIdp,
  'Login with Okta OIDC IDP': OktaSignInOIEOktaIdp,
  // React sample
  'Identify': IdentifyForm,
  'MyAccount Root': MyAccountHome,
  'Select Authenticator Authenticate': SelectAuthenticatorAuthenticate,
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
