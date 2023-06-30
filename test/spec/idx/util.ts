import {
  getAvailableSteps,
  getEnabledFeatures,
  getMessagesFromResponse,
  isTerminalResponse,
  getRemediator,
  getNextStep,
  handleFailedResponse
} from '../../../lib/idx/util';
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
import { IdxFeature, IdxResponse, OktaAuthIdxInterface } from '../../../lib/idx/types';
import { Remediator, GenericRemediator } from '../../../lib/idx/remediators';

jest.mock('../../../lib/idx/remediators/GenericRemediator');

describe('idx/util', () => {
  describe('getAvailableSteps', () => {
    it('returns an empty array if there are no remediations', () => {
      const authClient = {} as OktaAuthIdxInterface;
      const idxResponse = IdxResponseFactory.build();
      const res = getAvailableSteps(authClient, idxResponse);
      expect(res.length).toBe(0);
    });
    it('returns next step for identify remediation', () => {
      const authClient = {} as OktaAuthIdxInterface;
      const idxResponse = IdxResponseFactory.build({
        neededToProceed: [
          IdentifyRemediationFactory.build()
        ]
      });
      const res = getAvailableSteps(authClient, idxResponse);
      expect(res).toEqual([{
        inputs: [{
          label: 'Username',
          name: 'username',
          required: true,
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
          'currentAuthenticator-recover': function() {}
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
      const res = getMessagesFromResponse(idxResponse, {});
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
      const res = getMessagesFromResponse(idxResponse, {});
      expect(res).toEqual([{
        class: 'ERROR',
        i18n: {
          key: 'security.access_denied'
        },
        message: 'You do not have permission to perform the requested action.'
      }]);
    });

    describe('form level messages', () => {
      let idxResponse;
      beforeEach(() => {
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
        idxResponse = IdxResponseFactory.build({
          neededToProceed: [challengeAuthenticatorRemediation]
        });
      });

      it('returns messages on a remediation form', () => {
        const res = getMessagesFromResponse(idxResponse, {});
        expect(res).toEqual([{
          class: 'ERROR',
          i18n: {
            key: 'api.authn.error.PASSCODE_INVALID',
            params: []
          },
          message: 'Invalid code. Try again.'
        }]);
      });

      it('not return messages on a remediation form when use generic remediator', () => {
        const res = getMessagesFromResponse(idxResponse, { useGenericRemediator: true });
        expect(res).toEqual([]);
      });
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

  describe('getRemediator', () => {
    let testContext;
    beforeEach(() => {
      const FooRemediator = jest.fn();
      const BarRemediator = jest.fn();
      const remediators = {
        foo: FooRemediator,
        bar: BarRemediator
      };
      const options = { remediators };
      const values = {};
      testContext = {
        FooRemediator,
        BarRemediator,
        remediators,
        options,
        values,
      };
    });

    describe('A Remediator exists that matches one of the idx remediations', () => {
      beforeEach(() => {
        const neededToProceed = [{
          name: 'foo'
        }, {
          name: 'bar'
        }];
        const idxResponse = {
          neededToProceed
        } as IdxResponse;
        testContext = {
          ...testContext,
          neededToProceed,
          idxResponse
        };
      });

      it('if first Remediator can remediate, returns the first Remediator instance', () => {
        const { idxResponse, neededToProceed, values, options, FooRemediator } = testContext;
        FooRemediator.prototype.canRemediate = jest.fn().mockReturnValue(true);
        expect(getRemediator(idxResponse, values, options)).toBeInstanceOf(FooRemediator);
        expect(FooRemediator).toHaveBeenCalledWith(neededToProceed[0], values, options);
      });

      it('if first matched Remediator cannot remediate, but 2nd Remediator can, returns the 2nd Remediator', () => {
        const { idxResponse, neededToProceed, values, options, FooRemediator, BarRemediator } = testContext;
        FooRemediator.prototype.canRemediate = jest.fn().mockReturnValue(false);
        BarRemediator.prototype.canRemediate = jest.fn().mockReturnValue(true);
        expect(getRemediator(idxResponse, values, options)).toBeInstanceOf(BarRemediator);
        expect(BarRemediator).toHaveBeenCalledWith(neededToProceed[1], values, options);
      });
      it('if no Remediator can remediate, returns the first matching Remediator instance', () => {
        const { idxResponse, neededToProceed, values, options, FooRemediator, BarRemediator } = testContext;
        FooRemediator.prototype.canRemediate = jest.fn().mockReturnValue(false);
        BarRemediator.prototype.canRemediate = jest.fn().mockReturnValue(false);
        expect(getRemediator(idxResponse, values, options)).toBeInstanceOf(FooRemediator);
        expect(FooRemediator).toHaveBeenCalledWith(neededToProceed[0], values, options);
      });

      describe('with options.step', () => {

        it('returns a remediator instance if a Remediator exists that matches the idx remediation with the given step name', () => {
          const { idxResponse, neededToProceed, values, options, BarRemediator } = testContext;
          options.step = 'bar';
          expect(getRemediator(idxResponse, values, options)).toBeInstanceOf(BarRemediator);
          expect(BarRemediator).toHaveBeenCalledWith(neededToProceed[1], values, options);
        });
        it('returns undefined if no Remediator could be found matching the idx remediation with the given step name', () => {
          const { idxResponse, values, options } = testContext;
          options.step = 'bar';
          options.remediators = {
            'other': jest.fn()
          };
          expect(getRemediator(idxResponse, values, options)).toBe(undefined);
        });
        it('returns undefined if no idx remediation is found matching the given step name', () => {
          const { idxResponse, values, options } = testContext;
          options.step = 'bar';
          const neededToProceed = [{
            name: 'other'
          }];
          idxResponse.neededToProceed = neededToProceed;
          expect(getRemediator(idxResponse, values, options)).toBe(undefined);
        });
      });
    });

    it('returns undefined if no Remediator exists that matches the idx remediations', () => {
      const { values, options } = testContext;
      const neededToProceed = [{
        name: 'unknown'
      }];
      const idxResponse = {
        neededToProceed
      } as IdxResponse;
      options.remediators = {
        other: jest.fn()
      };
      expect(getRemediator(idxResponse, values, options)).toBe(undefined);
    });

    describe('with options.useGenericRemediator', () => {
      beforeEach(() => {
        const options = { 
          ...testContext.options, 
          useGenericRemediator: true 
        };
        const neededToProceed = [{
          name: 'foo'
        }, {
          name: 'bar'
        }];
        const idxResponse = {
          neededToProceed
        } as IdxResponse;
        testContext = {
          ...testContext,
          neededToProceed,
          idxResponse,
          options
        };
      });

      describe('with options.step', () => {
        it('returns GenericRemediator instance if one idx remediation can match the given step name', () => {
          const { idxResponse, neededToProceed, values, options } = testContext;
          options.step = 'bar';
          expect(getRemediator(idxResponse, values, options)).toBeInstanceOf(GenericRemediator);
          expect(GenericRemediator).toHaveBeenCalledWith(neededToProceed[1], values, options);
        });
        it('returns undefined if no idx remediation is found matching the given step name', () => {
          const { idxResponse, values, options } = testContext;
          options.step = 'bar';
          const neededToProceed = [{
            name: 'other'
          }];
          idxResponse.neededToProceed = neededToProceed;
          expect(getRemediator(idxResponse, values, options)).toBe(undefined);
        });
      });

      describe('without options.step', () => {
        it('if first Remediator can remediate, returns the first Remediator instance', () => {
          const { idxResponse, neededToProceed, values, options, FooRemediator } = testContext;
          FooRemediator.prototype.canRemediate = jest.fn().mockReturnValue(true);
          expect(getRemediator(idxResponse, values, options)).toBeInstanceOf(GenericRemediator);
          expect(GenericRemediator).toHaveBeenCalledWith(neededToProceed[0], values, options);
        });

        it('if first matched Remediator cannot remediate, but 2nd Remediator can, returns the first Remediator instance', () => {
          const { idxResponse, neededToProceed, values, options, FooRemediator, BarRemediator } = testContext;
          FooRemediator.prototype.canRemediate = jest.fn().mockReturnValue(false);
          BarRemediator.prototype.canRemediate = jest.fn().mockReturnValue(true);
          expect(getRemediator(idxResponse, values, options)).toBeInstanceOf(GenericRemediator);
          expect(GenericRemediator).toHaveBeenCalledWith(neededToProceed[0], values, options);
        });
        it('if no Remediator can remediate, returns the first Remediator instance', () => {
          const { idxResponse, neededToProceed, values, options, FooRemediator, BarRemediator } = testContext;
          FooRemediator.prototype.canRemediate = jest.fn().mockReturnValue(false);
          BarRemediator.prototype.canRemediate = jest.fn().mockReturnValue(false);
          expect(getRemediator(idxResponse, values, options)).toBeInstanceOf(GenericRemediator);
          expect(GenericRemediator).toHaveBeenCalledWith(neededToProceed[0], values, options);
        });
      });

    });

  });

  describe('getNextStep', () => {
    let testContext;
    beforeEach(() => {
      const nextStep = { fake: true };
      const remediator: Remediator = {
        getNextStep: jest.fn().mockReturnValue(nextStep)
      } as unknown as Remediator;
      const authClient = {} as OktaAuthIdxInterface;
      const context = {
         foo: 'bar'
      };
      const neededToProceed = [{
        name: 'unknown-remediation'
      }];
      const actions = {
        'some-action': jest.fn()
      };
      const idxResponse: IdxResponse = {
        context,
        neededToProceed,
        actions
      } as unknown as IdxResponse;
      testContext = {
        authClient,
        nextStep,
        remediator,
        context,
        neededToProceed,
        actions,
        idxResponse
      };
    });

    it('calls getNextStep() on the Remediator, passing the context from the idxResponse', () => {
      const { authClient, remediator, context, idxResponse, nextStep } = testContext;
      const res = getNextStep(authClient, remediator, idxResponse);
      expect(remediator.getNextStep).toHaveBeenCalledWith(authClient, context);
      expect(res).toEqual(nextStep);
    });

    it('adds canSkip to the response if neededToProceed includes skip remediation', () => {
      const { authClient, remediator, context, idxResponse, nextStep, neededToProceed } = testContext;
      neededToProceed.push({ name: 'skip' });
      const res = getNextStep(authClient, remediator, idxResponse);
      expect(remediator.getNextStep).toHaveBeenCalledWith(authClient, context);
      expect(res).toEqual({
        ...nextStep,
        canSkip: true
      });
    });

    it('adds canResend to the response if actions includes an action name with a resend suffix', () => {
      const { authClient, remediator, context, idxResponse, nextStep, actions } = testContext;
      actions['someaction-resend'] = jest.fn();
      const res = getNextStep(authClient, remediator, idxResponse);
      expect(remediator.getNextStep).toHaveBeenCalledWith(authClient, context);
      expect(res).toEqual({
        ...nextStep,
        canResend: true
      });
    });
  });

  describe('handleFailedResponse', () => {
    let testContext;
    beforeEach(() => {
      const authClient = {} as OktaAuthIdxInterface;
      const idxResponse = {
        neededToProceed: [],
        actions: {},
        rawIdxState: {
          version: 'fake'
        }
      } as unknown as IdxResponse;
      testContext = {
        authClient,
        idxResponse,
      };
    });

    it('For terminal IDX responses, it returns it with terminal flag', () => {
      const { authClient, idxResponse } = testContext;
      const res = handleFailedResponse(authClient, idxResponse);
      expect(res).toEqual({
        idxResponse,
        messages: [],
        terminal: true,
      });
    });
    it('non-terminal IDX responses, no remediator: it returns it', () => {
      const { authClient, idxResponse } = testContext;
      idxResponse.neededToProceed.push({
        name: 'some-remediation'
      });
      const FooRemediator = jest.fn();
      const remediators = {
        foo: FooRemediator,
      };
      const options = { remediators };
      const res = handleFailedResponse(authClient, idxResponse, options);
      expect(res).toEqual({
        idxResponse,
        messages: [],
      });
    });
    it('non-terminal IDX response and a remediator: returns it along with next step info', () => {
      const { authClient, idxResponse } = testContext;
      const context = { fake: true };
      idxResponse.context = context;
      idxResponse.neededToProceed.push({
        name: 'foo'
      });
      const nextStep = { fake: true };
      const mockGetNextStep = jest.fn().mockReturnValue(nextStep);
      const FooRemediator = jest.fn().mockImplementation(() => {
        return {
          canRemediate: jest.fn().mockReturnValue(true),
          getNextStep: mockGetNextStep,
        };
      });
      const remediators = {
        foo: FooRemediator,
      };
      const options = { remediators };
      const res = handleFailedResponse(authClient, idxResponse, options);
      expect(res).toEqual({
        idxResponse,
        messages: [],
        nextStep
      });
      expect(mockGetNextStep).toHaveBeenCalledWith(authClient, context);
    });
  });
});
