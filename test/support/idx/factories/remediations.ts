import { Factory } from 'fishery';
import { IdxRemediation, IdxAuthenticator, IdxForm } from '../../../../lib/idx/types/idx-js';
import {
  EmailAuthenticatorFactory,
  PasswordAuthenticatorFactory,
  PhoneAuthenticatorFactory
} from './authenticators';
import { EmailAuthenticatorFormFactory, PhoneAuthenticatorFormFactory, UserProfileFormFactory, VerifySmsFormFactory } from './forms';
import {
  EmailAuthenticatorOptionFactory,
  OktaVerifyAuthenticatorOptionFactory,
  PhoneAuthenticatorOptionFactory
} from './options';
import {
  UsernameValueFactory,
  PasswordValueFactory,
  AuthenticatorValueFactory,
  CredentialsValueFactory,
  IdxValueFactory,
  NewPasswordValueFactory,
} from './values';

interface MockedIdxRemediation extends IdxRemediation {
  _authenticator?: IdxAuthenticator;
  _form?: IdxForm;
}

export const IdxRemediationFactory = Factory.define<MockedIdxRemediation>(() => {
  return {
    name: 'unknown-remediation',
    value: []
  };
});

export const IdentifyRemediationFactory = IdxRemediationFactory.params({
  name: 'identify',
  value:[
    UsernameValueFactory.build()
  ]
});

export const IdentifyWithPasswordRemediationFactory = IdentifyRemediationFactory.params({
  value:[
    UsernameValueFactory.build(),
    PasswordValueFactory.build()
  ]
});

export const VerifyPasswordRemediationFactory = IdentifyRemediationFactory.params({
  name: 'challenge-authenticator',
  value: [
    PasswordValueFactory.build()
  ],
  relatesTo: {
    value: PasswordAuthenticatorFactory.build()
  }
});

export const SelectAuthenticatorRemediationFactory = IdxRemediationFactory.params({
  name: 'select-authenticator-authenticate',
  value: [
    AuthenticatorValueFactory.build({
      options: [
        OktaVerifyAuthenticatorOptionFactory.build(),
        PhoneAuthenticatorOptionFactory.build(),
        EmailAuthenticatorOptionFactory.build()
      ]
    })
  ]
});

export const RecoverPasswordRemediationFactory = IdxRemediationFactory.params({
  name: 'recover'
});

export const AuthenticatorEnrollmentDataRemediationFactory = IdxRemediationFactory.params({
  name: 'authenticator-enrollment-data'
});

export const PhoneAuthenticatorEnrollmentDataRemediationFactory = AuthenticatorEnrollmentDataRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: PhoneAuthenticatorFactory.build()
  },
  value: [
    AuthenticatorValueFactory.build({
      label: 'Phone',
      form: PhoneAuthenticatorFormFactory.build()
    })
  ]
});

export const EnrollAuthenticatorRemediationFactory = IdxRemediationFactory.params({
  name: 'enroll-authenticator'
});

export const EnrollEmailAuthenticatorRemediationFactory = EnrollAuthenticatorRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: EmailAuthenticatorFactory.build()
  },
  value: [
    CredentialsValueFactory.build({
      form: EmailAuthenticatorFormFactory.build()
    })
  ]
});

export const EnrollPhoneAuthenticatorRemediationFactory = EnrollAuthenticatorRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: PhoneAuthenticatorFactory.build()
  },
  value: [
    CredentialsValueFactory.build({
      form: VerifySmsFormFactory.build()
    })
  ]
});

export const EnrollProfileRemediationFactory = IdxRemediationFactory.params({
  name: 'enroll-profile',
  value: [
    IdxValueFactory.build({
      name: 'userProfile',
      form: UserProfileFormFactory.build()
    })
  ]
});

export const SelectEnrollProfileRemediationFactory = IdxRemediationFactory.params({
  name: 'select-enroll-profile'
});

export const IdentifyRecoveryRemediationFactory = IdxRemediationFactory.params({
  name: 'identify-recovery',
  value: [
    UsernameValueFactory.build()
  ]
});

export const ReEnrollAuthenticatorRemediationFactory = IdxRemediationFactory.params({
  name: 'reenroll-authenticator',
});

export const ReEnrollPasswordAuthenticatorRemediationFactory = ReEnrollAuthenticatorRemediationFactory.params({
  relatesTo: {
    type: 'object',
    value: PasswordAuthenticatorFactory.build()
  },
  value: [
    CredentialsValueFactory.build({
      form: {
        value: [
          NewPasswordValueFactory.build()
        ]
      }
    })
  ]
});

export const AuthenticatorVerificationDataRemediationFactory = IdxRemediationFactory.params({
  name: 'authenticator-verification-data',
});


// [
//   {
//       "rel": [
//           "create-form"
//       ],
//       "name": "authenticator-verification-data",
//       "relatesTo": {
//           "type": "object",
//           "value": {
//               "profile": {
//                   "phoneNumber": "+1 XXX-XXX-0044"
//               },
//               "resend": {
//                   "rel": [
//                       "create-form"
//                   ],
//                   "name": "resend",
//                   "href": "https://dev-64717063.okta.com/idp/idx/challenge/resend",
//                   "method": "POST",
//                   "produces": "application/ion+json; okta-version=1.0.0",
//                   "value": [
//                       {
//                           "name": "stateHandle",
//                           "required": true,
//                           "value": "02UdoGJuNYHKV-QFw1k3eMTZL0GTcm3tI-0aKWK2OD",
//                           "visible": false,
//                           "mutable": false
//                       }
//                   ],
//                   "accepts": "application/json; okta-version=1.0.0"
//               },
//               "type": "phone",
//               "key": "phone_number",
//               "id": "paeskx9tr1ltAytas5d6",
//               "displayName": "Phone",
//               "methods": [
//                   {
//                       "type": "sms"
//                   },
//                   {
//                       "type": "voice"
//                   }
//               ]
//           }
//       },
//       "href": "https://dev-64717063.okta.com/idp/idx/challenge",
//       "method": "POST",
//       "produces": "application/ion+json; okta-version=1.0.0",
//       "value": [
//           {
//               "name": "authenticator",
//               "label": "Phone",
//               "form": {
//                   "value": [
//                       {
//                           "name": "id",
//                           "required": true,
//                           "value": "autl0dnf8xY0xTY855d6",
//                           "mutable": false
//                       },
//                       {
//                           "name": "methodType",
//                           "type": "string",
//                           "required": true,
//                           "options": [
//                               {
//                                   "label": "SMS",
//                                   "value": "sms"
//                               },
//                               {
//                                   "label": "Voice call",
//                                   "value": "voice"
//                               }
//                           ]
//                       },
//                       {
//                           "name": "enrollmentId",
//                           "required": true,
//                           "value": "paeskx9tr1ltAytas5d6",
//                           "mutable": false
//                       }
//                   ]
//               }
//           },
//           {
//               "name": "stateHandle",
//               "required": true,
//               "value": "02UdoGJuNYHKV-QFw1k3eMTZL0GTcm3tI-0aKWK2OD",
//               "visible": false,
//               "mutable": false
//           }
//       ],
//       "accepts": "application/json; okta-version=1.0.0"
//   },
//   {
//       "rel": [
//           "create-form"
//       ],
//       "name": "select-authenticator-authenticate",
//       "href": "https://dev-64717063.okta.com/idp/idx/challenge",
//       "method": "POST",
//       "produces": "application/ion+json; okta-version=1.0.0",
//       "value": [
//           {
//               "name": "authenticator",
//               "type": "object",
//               "options": [
//                   {
//                       "label": "Phone",
//                       "value": {
//                           "form": {
//                               "value": [
//                                   {
//                                       "name": "id",
//                                       "required": true,
//                                       "value": "autl0dnf8xY0xTY855d6",
//                                       "mutable": false
//                                   },
//                                   {
//                                       "name": "methodType",
//                                       "type": "string",
//                                       "required": false,
//                                       "options": [
//                                           {
//                                               "label": "SMS",
//                                               "value": "sms"
//                                           },
//                                           {
//                                               "label": "Voice call",
//                                               "value": "voice"
//                                           }
//                                       ]
//                                   },
//                                   {
//                                       "name": "enrollmentId",
//                                       "required": true,
//                                       "value": "paeskx9tr1ltAytas5d6",
//                                       "mutable": false
//                                   }
//                               ]
//                           }
//                       },
//                       "relatesTo": {
//                           "profile": {
//                               "phoneNumber": "+1 XXX-XXX-0044"
//                           },
//                           "type": "phone",
//                           "key": "phone_number",
//                           "id": "paeskx9tr1ltAytas5d6",
//                           "displayName": "Phone",
//                           "methods": [
//                               {
//                                   "type": "sms"
//                               },
//                               {
//                                   "type": "voice"
//                               }
//                           ]
//                       }
//                   }
//               ]
//           },
//           {
//               "name": "stateHandle",
//               "required": true,
//               "value": "02UdoGJuNYHKV-QFw1k3eMTZL0GTcm3tI-0aKWK2OD",
//               "visible": false,
//               "mutable": false
//           }
//       ],
//       "accepts": "application/json; okta-version=1.0.0"
//   }
// ]