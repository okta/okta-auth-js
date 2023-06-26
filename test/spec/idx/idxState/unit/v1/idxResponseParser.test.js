/*!
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */


import { parseNonRemediations, parseIdxResponse } from '../../../../../../lib/idx/idxState/v1/idxResponseParser';

const mockIdxResponse = require('../../mocks/challenge-password');
const mockAuthenticatorVerificationSelectAuthenticator = require('../../mocks/authenticator-verification-select-authenticator');
const mockAuthenticatorVerificationPassword = require('../../mocks/authenticator-verification-password');
const mockSmallIdxResponse = require('../../mocks/request-identifier');
const mockComplexContextIdxResponse = require('../../mocks/poll-for-password');
const mockTerminalIdxResponse = require('../../mocks/terminal-return-email');
const mockMessageIdxResponse = require('../../mocks/unknown-user');
const mockSuccessIdxResponse = require('../../mocks/success');
const mockIdxResponseWithBadRelationship = () => {
  const mock = require('../../mocks/authenticator-verification-password');
  mock.remediation.value[1].value[0].options[0].relatesTo = '$.authenticatorEnrollments.value[999]';
  return mock;
};

jest.mock('../../../../../../lib/idx/idxState/v1/generateIdxAction');
jest.mock('../../../../../../lib/idx/idxState/v1/remediationParser');
jest.mock('../../../../../../lib/idx/idxState/v1/actionParser');

// imports to target for mockery
import { generateRemediationFunctions } from '../../../../../../lib/idx/idxState/v1/remediationParser';
import { divideActionParamsByMutability } from '../../../../../../lib/idx/idxState/v1/actionParser';
import generateIdxAction from '../../../../../../lib/idx/idxState/v1/generateIdxAction';

generateIdxAction.mockReturnValue('generated function');
generateRemediationFunctions.mockReturnValue('generated collection of functions');
divideActionParamsByMutability.mockReturnValue( { defaultParams: 'defaultParams', neededParams: 'neededParams', immutableParams: 'immutableParams'});

describe('idxResponseParser', () => {
  describe('parseNonRemediations', () => {

    it('copies simple context items', () => {
      const { context } = parseNonRemediations( {}, mockIdxResponse );
      expect( context ).toEqual({
        expiresAt: mockIdxResponse.expiresAt,
        step: mockIdxResponse.step,
        intent: mockIdxResponse.intent,
        user: mockIdxResponse.user,
        stateHandle: mockIdxResponse.stateHandle,
        version: '1.0.0',
        factor: {
          type: 'object',
          value: {
            factorId: '00u1wlnlh2x3sQemR357',
            factorProfileId: 'fpr1w2vlszZt2g3E4357',
            factorType: 'password',
          },
        },
      });
    });

    it('copies terminal messages', () => {
      const { context } = parseNonRemediations( {}, mockTerminalIdxResponse );
      expect( context.terminal ).toEqual( mockTerminalIdxResponse.terminal );
    });

    it('copies non-terminal messages', () => {
      const { context } = parseNonRemediations( {}, mockMessageIdxResponse );
      expect( context.messages ).toEqual( mockMessageIdxResponse.messages );
    });

    it('copies token info', () => {
      const { context } = parseNonRemediations( {}, mockSuccessIdxResponse );
      expect( context.success ).toMatchObject( mockSuccessIdxResponse.success );
    });

    it('handles missing simple context items', () => {
      const { context } = parseNonRemediations( {}, mockSmallIdxResponse );
      expect(mockSmallIdxResponse.user).not.toBeDefined();
      expect(context.user).not.toBeDefined();
    });

    it('translates simple actions', () => {
      const { actions } = parseNonRemediations( {}, mockIdxResponse );
      expect( actions.cancel ).toBe('generated function');
    });

    it('pulls apart complicated actions/context', () => {
      const { context, actions } = parseNonRemediations( {}, mockIdxResponse );
      expect( actions['factor-recover'] ).toBe('generated function');
      expect( context.factor ).toStrictEqual({
        type: 'object',
        value: {
          factorId: '00u1wlnlh2x3sQemR357',
          factorProfileId: 'fpr1w2vlszZt2g3E4357',
          factorType: 'password'
        }
      });
    });

    it('handles multiple actions in a complex context field', () => {
      const { context, actions } = parseNonRemediations( {}, mockComplexContextIdxResponse );
      expect( actions['factor-send'] ).toBe('generated function');
      expect( actions['factor-poll'] ).toBe('generated function');
      expect( context.factor ).toStrictEqual({
        type: 'object',
        value: {
          factorId: 'emf2a6n2omrZ7Abnt357',
          factorProfileId: 'fpr1w2vlstxSAQsHZ357',
          factorType: 'email',
          profile: {
            email: 'test.idx@swiftone.org',
          },
        }
      });
    });
  });

  describe('parseIdxResponse', () => {

    it('builds remediation functions', () => {
      const { remediations } = parseIdxResponse( {}, mockIdxResponse );
      expect( generateRemediationFunctions.mock.calls.length ).toBe(1);
      expect( generateRemediationFunctions.mock.calls[0] ).toMatchObject( [{}, mockIdxResponse.remediation.value, {}] );
      expect( remediations[0].name ).toBe('challenge-factor');
      expect( remediations[0].href ).toBe('https://dev-550580.okta.com/idp/idx/challenge/answer');
      expect( remediations[0].method ).toBe('POST');
    });

    it('builds context and actions', () => {
      const { context, actions } = parseIdxResponse( {}, mockIdxResponse );
      expect( context ).toStrictEqual({
        expiresAt: mockIdxResponse.expiresAt,
        step: mockIdxResponse.step,
        intent: mockIdxResponse.intent,
        user: mockIdxResponse.user,
        factor: {
          type: 'object',
          value: {
            factorType: mockIdxResponse.factor.value.factorType,
            factorProfileId: mockIdxResponse.factor.value.factorProfileId,
            factorId: mockIdxResponse.factor.value.factorId,
          }
        },
        stateHandle: mockIdxResponse.stateHandle,
        version: mockIdxResponse.version,
      });
      expect( actions.cancel ).toBe('generated function');
    });

    it('builds remediation for authenticator-verify-select-authenticator', () => {
      const toPersist = {};
      const { remediations } = parseIdxResponse( {}, mockAuthenticatorVerificationSelectAuthenticator, toPersist );
      expect( generateRemediationFunctions.mock.calls.length ).toBe(1);
      expect( generateRemediationFunctions.mock.calls[0] ).toMatchObject( [{}, mockAuthenticatorVerificationSelectAuthenticator.remediation.value, toPersist ] );
      expect( remediations[0] ).toMatchSnapshot();
    });

    it('builds remediation functions for authenticator-verify-password', () => {
      const toPersist = {};
      const { remediations } = parseIdxResponse( {}, mockAuthenticatorVerificationPassword, toPersist );
      expect( generateRemediationFunctions.mock.calls.length ).toBe(2);
      expect( generateRemediationFunctions.mock.calls[0] ).toMatchObject( [ {}, [mockAuthenticatorVerificationPassword.remediation.value[0]], toPersist ] );
      expect( generateRemediationFunctions.mock.calls[1] ).toMatchObject( [ {}, [mockAuthenticatorVerificationPassword.remediation.value[1]], toPersist ] );
      expect( remediations[0]).toMatchSnapshot();
    });

    it('throws error if relatesTo can\'t be resolved', () => {
      const fn = () => parseIdxResponse( {}, mockIdxResponseWithBadRelationship() );
      expect(fn).toThrowError('Cannot resolve relatesTo: $.authenticatorEnrollments.value[999]');
    });
  });
});
