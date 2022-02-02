import { getAvailableSteps, getEnabledFeatures, getMessagesFromResponse, isTerminalResponse } from '../../../lib/idx/util';
import {
  IdxResponseFactory,
  IdentifyRemediationFactory,
  RawIdxResponseFactory,
  IdxMessagesFactory,
  CredentialsValueFactory,
  SelectEnrollProfileRemediationFactory,
  RedirectIdpRemediationFactory,
  IdxErrorAccessDeniedFactory,
  ChallengeAuthenticatorRemediationFactory,
  PhoneAuthenticatorFactory,
  PasscodeValueFactory,
  IdxErrorPasscodeInvalidFactory
} from '@okta/test.support/idx';
import { IdxFeature } from '../../../lib/idx/types';

describe('idx/util', () => {
  describe('getAvailableSteps', () => {
    it('returns an empty array if there are no remediations', () => {
      const idxResponse = IdxResponseFactory.build();
      const res = getAvailableSteps(idxResponse);
      expect(res.length).toBe(0);
    });
    it('returns next step for identify remediation', () => {
      const idxResponse = IdxResponseFactory.build({
        neededToProceed: [
          IdentifyRemediationFactory.build()
        ]
      });
      const res = getAvailableSteps(idxResponse);
      expect(res).toEqual([{
        inputs: [{
          label: 'Username',
          name: 'username',
        }],
        name: 'identify'
      }]);
    });
  });

  describe('getEnabledFeatures', () => {
    it('returns an empty array on a basic response', () => {
      const idxResponse = IdxResponseFactory.build();
      const res = getEnabledFeatures(idxResponse);
      expect(res.length).toBe(0);
    });

    it('returns feature PASSWORD_RECOVERY if "currentAuthenticator-recover" action exists', () => {
      const idxResponse = IdxResponseFactory.build({
        actions: {
          'currentAuthenticator-recover': function() {} as Function
        }
      });
      const res = getEnabledFeatures(idxResponse);
      expect(res).toEqual([IdxFeature.PASSWORD_RECOVERY]);
    });

    it('returns feature REGISTRATION if "select-enroll-profile" remediation exists', () => {
      const idxResponse = IdxResponseFactory.build({
        neededToProceed: [
          SelectEnrollProfileRemediationFactory.build()
        ]
      });
      const res = getEnabledFeatures(idxResponse);
      expect(res).toEqual([IdxFeature.REGISTRATION]);
    });

    it('returns feature SOCIAL_IDP if "redirect-idp" remediation exists', () => {
      const idxResponse = IdxResponseFactory.build({
        neededToProceed: [
          RedirectIdpRemediationFactory.build()
        ]
      });
      const res = getEnabledFeatures(idxResponse);
      expect(res).toEqual([IdxFeature.SOCIAL_IDP]);
    });

  });

  describe('getMessagesFromResponse', () => {
    it('returns an empty array on a basic response', () => {
      const idxResponse = IdxResponseFactory.build();
      const res = getMessagesFromResponse(idxResponse);
      expect(res.length).toBe(0);
    });

    it('returns messages at the top level', () => {
      const rawIdxState = RawIdxResponseFactory.build({
        messages: IdxMessagesFactory.build({
          value: [
            IdxErrorAccessDeniedFactory.build()
          ]
        })
      });
      const idxResponse = IdxResponseFactory.build({
        rawIdxState
      });
      const res = getMessagesFromResponse(idxResponse);
      expect(res).toEqual([{
        class: 'ERROR',
        i18n: {
          key: 'security.access_denied'
        },
        message: 'You do not have permission to perform the requested action.'
      }]);
    });

    it('returns messages on a remediation form', () => {
      const challengeAuthenticatorRemediation = ChallengeAuthenticatorRemediationFactory.build({
        relatesTo: {
          type: 'object',
          value: PhoneAuthenticatorFactory.build()
        },
        value: [
          CredentialsValueFactory.build({
            form: {
              value: [
                PasscodeValueFactory.build({
                  messages: IdxMessagesFactory.build({
                    value: [
                      IdxErrorPasscodeInvalidFactory.build()
                    ]
                  })
                })
              ]
            }
          })
        ]
      });
      const idxResponse = IdxResponseFactory.build({
        neededToProceed: [challengeAuthenticatorRemediation]
      });
      const res = getMessagesFromResponse(idxResponse);
      expect(res).toEqual([{
        class: 'ERROR',
        i18n: {
          key: 'api.authn.error.PASSCODE_INVALID',
          params: []
        },
        message: 'Invalid code. Try again.'
      }]);
    });

  });

  describe('isTerminalResponse', () => {
    it('returns false if neededToProceed is not empty', () => {
      const idxResponse = IdxResponseFactory.build({
        neededToProceed: [
          IdentifyRemediationFactory.build()
        ]
      });
      const res = isTerminalResponse(idxResponse);
      expect(res).toBe(false);
    });
    it('returns true if neededToProceed is empty and there is no interactionCode', () => {
      const idxResponse = IdxResponseFactory.build({
        neededToProceed: []
      });
      const res = isTerminalResponse(idxResponse);
      expect(res).toBe(true);
    });
    it('returns false if response contains an interactionCode', () => {
      const idxResponse = IdxResponseFactory.build({
        neededToProceed: [],
        interactionCode: 'abc'
      });
      const res = isTerminalResponse(idxResponse);
      expect(res).toBe(false);
    });
  });
});
