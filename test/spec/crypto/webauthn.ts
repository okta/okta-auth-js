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

  it('includes hints when present in activationData', () => {
    const activationData: ActivationData = {
      rp: { name: 'Test Org' },
      user: { id: '00u123', name: 'user@test.com', displayName: 'User' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      challenge: 'G7bIvwrJJ33WCEp6GGSH',
      hints: ['security-key'],
    };
    const options = buildCredentialCreationOptions(activationData, []);
    expect((options.publicKey as any).hints).toEqual(['security-key']);
  });

  it('does not include hints when not present in activationData', () => {
    const activationData: ActivationData = {
      rp: { name: 'Test Org' },
      user: { id: '00u123', name: 'user@test.com', displayName: 'User' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      challenge: 'G7bIvwrJJ33WCEp6GGSH',
    };
    const options = buildCredentialCreationOptions(activationData, []);
    expect((options.publicKey as any).hints).toBeUndefined();
  });

  it('includes transports in excludeCredentials when present on enrollments', () => {
    const activationData: ActivationData = {
      rp: { name: 'Test Org' },
      user: { id: '00u123', name: 'user@test.com', displayName: 'User' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      challenge: 'G7bIvwrJJ33WCEp6GGSH',
    };
    const authenticatorEnrollments: IdxAuthenticator[] = [{
      id: 'AUTHENTICATOR-ID-1',
      displayName: 'MacBook Touch ID',
      key: 'webauthn',
      type: 'security_key',
      methods: [{ type: 'webauthn' }],
      credentialId: 'vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt',
      transports: ['internal'],
    }];
    const options = buildCredentialCreationOptions(activationData, authenticatorEnrollments);
    expect(options.publicKey!.excludeCredentials).toEqual([{
      type: 'public-key',
      id: base64UrlToBuffer('vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt'),
      transports: ['internal'],
    }]);
  });

  it('includes transports from profile in excludeCredentials when not at top-level', () => {
    const activationData: ActivationData = {
      rp: { name: 'Test Org' },
      user: { id: '00u123', name: 'user@test.com', displayName: 'User' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      challenge: 'G7bIvwrJJ33WCEp6GGSH',
    };
    const authenticatorEnrollments: IdxAuthenticator[] = [{
      id: 'AUTHENTICATOR-ID-1',
      displayName: 'MacBook Touch ID',
      key: 'webauthn',
      type: 'security_key',
      methods: [{ type: 'webauthn' }],
      credentialId: 'vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt',
      profile: { transports: ['usb'] },
    }];
    const options = buildCredentialCreationOptions(activationData, authenticatorEnrollments);
    expect(options.publicKey!.excludeCredentials).toEqual([{
      type: 'public-key',
      id: base64UrlToBuffer('vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt'),
      transports: ['usb'],
    }]);
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

  it('includes transports in allowCredentials when present on enrollments', () => {
    const challengeData: ChallengeData = {
      challenge: 'G7bIvwrJJ33WCEp6GGSH',
      userVerification: 'preferred',
    };
    const authenticatorEnrollments: IdxAuthenticator[] = [{
      id: 'AUTHENTICATOR-ID-1',
      displayName: 'MacBook Touch ID',
      key: 'webauthn',
      type: 'security_key',
      methods: [{ type: 'webauthn' }],
      credentialId: 'vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt',
      transports: ['internal'],
    }];
    const options = buildCredentialRequestOptions(challengeData, authenticatorEnrollments);
    expect(options.publicKey!.allowCredentials).toEqual([{
      type: 'public-key',
      id: base64UrlToBuffer('vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt'),
      transports: ['internal'],
    }]);
  });

  it('includes transports from profile when not at top-level', () => {
    const challengeData: ChallengeData = {
      challenge: 'G7bIvwrJJ33WCEp6GGSH',
      userVerification: 'preferred',
    };
    const authenticatorEnrollments: IdxAuthenticator[] = [{
      id: 'AUTHENTICATOR-ID-1',
      displayName: 'MacBook Touch ID',
      key: 'webauthn',
      type: 'security_key',
      methods: [{ type: 'webauthn' }],
      credentialId: 'vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt',
      profile: { transports: ['usb'] },
    }];
    const options = buildCredentialRequestOptions(challengeData, authenticatorEnrollments);
    expect(options.publicKey!.allowCredentials).toEqual([{
      type: 'public-key',
      id: base64UrlToBuffer('vdCxImCygaKmXS3S_2WwgqF1LLZ4i_2MKYfAbrNByJOOmSyRD_STj6VfhLQsLdLrIdgvdP5EmO1n9Tuw5BawZt'),
      transports: ['usb'],
    }]);
  });

  it('includes hints when present in challengeData', () => {
    const challengeData: ChallengeData = {
      challenge: 'G7bIvwrJJ33WCEp6GGSH',
      userVerification: 'preferred',
      hints: ['client-device'],
    };
    const options = buildCredentialRequestOptions(challengeData, []);
    expect((options.publicKey as any).hints).toEqual(['client-device']);
  });

  it('does not include hints when not present in challengeData', () => {
    const challengeData: ChallengeData = {
      challenge: 'G7bIvwrJJ33WCEp6GGSH',
      userVerification: 'preferred',
    };
    const options = buildCredentialRequestOptions(challengeData, []);
    expect((options.publicKey as any).hints).toBeUndefined();
  });
});

describe('getAttestation', () => {
  it('builds attestation object for webauthn enroll', () => {
    const response = {
      clientDataJSON: stringToBuffer('{}'),
      attestationObject: stringToBuffer('{}'),
      getTransports: () => ['usb', 'nfc'] as AuthenticatorTransport[],
    } as AuthenticatorAttestationResponse;
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
      transports: '["usb","nfc"]',
    });
  });

  it('omits transports when getTransports is not supported', () => {
    const response = {
      clientDataJSON: stringToBuffer('{}'),
      attestationObject: stringToBuffer('{}'),
    } as AuthenticatorAttestationResponse;
    const credential = {
      rawId: base64UrlToBuffer('CRED-ID'),
      id: 'CRED-ID',
      type: 'public-key',
      response,
      getClientExtensionResults: () => ({} as AuthenticationExtensionsClientOutputs)
    };
    const attestation = getAttestation(credential);
    expect(attestation).toEqual({
      id: 'CRED-ID',
      clientData: btoa('{}'),
      attestation: btoa('{}'),
    });
    expect(attestation).not.toHaveProperty('transports');
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
    const credential: PublicKeyCredential = {
      rawId: base64UrlToBuffer('CRED-ID'),
      id: 'CRED-ID',
      type: 'public-key',
      response,
      getClientExtensionResults: () => ({} as AuthenticationExtensionsClientOutputs)
    };
    const assertion = getAssertion(credential);
    expect(assertion).toEqual({
      id: 'CRED-ID',
      clientData: btoa('{}'),
      authenticatorData: btoa('AUTH_DATA'),
      signatureData: btoa('SIG'),
    });
  });
});

