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


import {
  buildCredentialCreationOptions,
  buildCredentialRequestOptions,
  getAttestation,
  getAssertion
} from '../../../lib/idx/webauthn';
import { ActivationData, ChallengeData, IdxAuthenticator } from '../../../lib/idx/types';
import { base64UrlToBuffer, stringToBuffer } from '../../../lib/crypto/base64';
import { btoa } from '../../../lib/crypto/webcrypto';

describe('buildCredentialCreationOptions', () => {
  it('builds options for navigator.credentials.create', () => {
    const activationData: ActivationData = {
      rp: {
        name: 'Javascript IDX SDK Test Org'
      },
      user: {
        id: '00u1212qZXXap6Cts0g4',
        name: 'mary@acme.com',
        displayName: 'Mary'
      },
      pubKeyCredParams: [{
        type: 'public-key',
        alg: -7
      }, {
        type: 'public-key',
        alg: -257
      }],
      challenge: 'G7bIvwrJJ33WCEp6GGSH',
      attestation: 'direct',
      authenticatorSelection: {
        userVerification: 'discouraged',
        requireResidentKey: false,
      }
    };
    const authenticatorEnrollments: IdxAuthenticator[] = [{
      id: 'AUTHENTICATOR-ID-1',
      displayName: 'MacBook Touch ID',
      key: 'webauthn',
      type: 'security_key',
      methods: [
        { type: 'webauthn' }
      ],
      credentialId: 'vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt'
    }, {
      id: 'AUTHENTICATOR-ID-2',
      displayName: 'Phone',
      key: 'phone_number',
      type: 'phone',
      methods: [
        { type: 'sms' },
        { type: 'voice' },
      ]
    }];
    const options = buildCredentialCreationOptions(activationData, authenticatorEnrollments);
    expect(options).toEqual({
      publicKey: {
        rp: {
          name: 'Javascript IDX SDK Test Org'
        },
        user: {
          id: base64UrlToBuffer('00u1212qZXXap6Cts0g4'),
          name: 'mary@acme.com',
          displayName: 'Mary'
        },
        challenge: base64UrlToBuffer('G7bIvwrJJ33WCEp6GGSH'),
        pubKeyCredParams: [{
          type: 'public-key',
          alg: -7
        }, {
          type: 'public-key',
          alg: -257
        }],
        attestation: 'direct',
        authenticatorSelection: {
          userVerification: 'discouraged',
          requireResidentKey: false,
        },
        excludeCredentials: [{
          type: 'public-key',
          id: base64UrlToBuffer('vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt')
        }],
      }
    });
  });
});

describe('buildCredentialRequestOptions', () => {
  it('builds options for navigator.credentials.get', () => {
    const challengeData: ChallengeData = {
      challenge: 'G7bIvwrJJ33WCEp6GGSH',
      userVerification: 'preferred',
      rpId: 'acme.com'
    };
    const authenticatorEnrollments: IdxAuthenticator[] = [{
      id: 'AUTHENTICATOR-ID-1',
      displayName: 'MacBook Touch ID',
      key: 'webauthn',
      type: 'security_key',
      methods: [
        { type: 'webauthn' }
      ],
      credentialId: 'vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt'
    }];
    const options = buildCredentialRequestOptions(challengeData, authenticatorEnrollments);
    expect(options).toEqual({
      publicKey: {
        challenge: base64UrlToBuffer('G7bIvwrJJ33WCEp6GGSH'),
        userVerification: 'preferred',
        rpId: 'acme.com',
        allowCredentials: [{
          type: 'public-key',
          id: base64UrlToBuffer('vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt')
        }],
      }
    });
  });
});

describe('getAttestation', () => {
  it('builds attestation object for webauthn enroll', () => {
    const response = {
      clientDataJSON: stringToBuffer('{}'),
      attestationObject: stringToBuffer('{}'),
    } as AuthenticatorResponse;
    const credential = {
      rawId: base64UrlToBuffer('CRED-ID'),
      id: 'CRED-ID',
      type: 'public-key',
      response,
      getClientExtensionResults: () => ({} as AuthenticationExtensionsClientOutputs)
    };
    const attestation = getAttestation(credential as PublicKeyCredential);
    expect(attestation).toEqual({
      id: 'CRED-ID',
      clientData: btoa('{}'),
      attestation: btoa('{}'),
    });
  });
});

describe('getAssertion', () => {
  it('builds assertion object for webauthn verification', () => {
    const response = {
      clientDataJSON: stringToBuffer('{}'),
      authenticatorData: stringToBuffer('AUTH_DATA'),
      signature: stringToBuffer('SIG'),
      userHandle: null
    } as AuthenticatorAssertionResponse;
    const credential = {
      rawId: base64UrlToBuffer('CRED-ID'),
      id: 'CRED-ID',
      type: 'public-key',
      response,
      getClientExtensionResults: () => ({} as AuthenticationExtensionsClientOutputs)
    };
    const assertion = getAssertion(credential as PublicKeyCredential);
    expect(assertion).toEqual({
      id: 'CRED-ID',
      clientData: btoa('{}'),
      authenticatorData: btoa('AUTH_DATA'),
      signatureData: btoa('SIG'),
    });
  });
});

