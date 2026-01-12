import { remediate } from '../../../lib/idx/remediate';
import { IdxResponse } from '../../../lib/idx/types';

const util = require('../../../lib/idx/util');

jest.mock('../../../lib/idx/util', () => {
  const actual = jest.requireActual('../../../lib/idx/util');
  return { ...actual };
});

describe('idx/remediate', () => {
  let testContext;
  beforeEach(() => {
    const authClient = {};
    const idxResponse = {
      proceed: jest.fn(),
      neededToProceed: [],
      actions: {},
      rawIdxState: {}
    } as unknown as IdxResponse;
    const errorResponse = { fakeErrorResponse: true };
    jest.spyOn(util, 'handleFailedResponse').mockReturnValue(errorResponse);
    const remediator = {
      canRemediate: jest.fn(),
      getNextStep: jest.fn(),
      getName: jest.fn(),
      getData: jest.fn(),
      getValuesAfterProceed: jest.fn()
    };
    jest.spyOn(util, 'getRemediator').mockReturnValue(remediator);
    testContext = {
      authClient,
      idxResponse,
      errorResponse,
      remediator
    };
  });

  it('returns idxResponse immediately if idxResponse has an interaction code', async () => {
    const { authClient } = testContext;
    const idxResponse = {
      interactionCode: 'fake'
    } as unknown as IdxResponse;
    const res = await remediate(authClient, idxResponse, {}, {});
    expect(res).toEqual({ idxResponse });
  });

  it('returns idxResponse, terminal if the idxResponse is terminal', async () => {
    const { authClient } = testContext;
    jest.spyOn(util, 'isTerminalResponse').mockReturnValue(true);
    const idxResponse = { fake: true, actions: {} } as unknown as IdxResponse;
    const res = await remediate(authClient, idxResponse, {}, {});
    expect(res).toEqual({
      idxResponse,
      terminal: true,
    });
    expect(util.isTerminalResponse).toHaveBeenCalledWith(idxResponse);
  });

  describe('actions', () => {

    describe('values.resend = true', () => {

      describe('action exists in idx response with -resend suffix', () => {

        it('executes the resend action, and calls remediate recursively, removing resend from values', async () => {
          let { authClient, idxResponse } = testContext;
          const responseFromAction = {
            ...idxResponse,
            neededToProceed: [{
              name: 'another-remediation'
            }],
          };
          idxResponse = {
            ...idxResponse,
            neededToProceed: [{
              name: 'some-remediation'
            }],
            actions: {
              'something-resend': jest.fn().mockReturnValue(responseFromAction)
            },
          } as unknown as IdxResponse;
          const res = await remediate(authClient, idxResponse, { resend: true }, { enableLegacyMode: true });
          expect(res).toEqual({
            idxResponse: {
              ...responseFromAction
            },
            nextStep: {}
          });
          expect(util.getRemediator).toHaveBeenCalledTimes(1);
          expect(util.getRemediator).toHaveBeenNthCalledWith(1, responseFromAction, {}, { actions: [], enableLegacyMode: true });
        });

        it('[New Mode] execute resend action and return response', async () => {
          let { authClient, idxResponse } = testContext;
          const responseFromAction = {
            ...idxResponse,
            neededToProceed: [{
              name: 'another-remediation'
            }],
          };
          idxResponse = {
            ...idxResponse,
            neededToProceed: [{
              name: 'some-remediation'
            }],
            actions: {
              'something-resend': jest.fn().mockReturnValue(responseFromAction)
            },
          } as unknown as IdxResponse;
          const res = await remediate(authClient, idxResponse, { resend: true }, {});
          expect(res).toEqual({
            idxResponse: {
              ...responseFromAction
            },
            nextStep: {
              name: 'another-remediation'
            }
          });
          expect(util.getRemediator).toHaveBeenCalledTimes(0);
        });

        it('will handle exceptions', async () => {
          const { authClient } = testContext;
          const error = new Error('my test error');
          const idxResponse = {
            neededToProceed: [{
              name: 'some-remediation'
            }],
            actions: {
              'something-resend': jest.fn().mockRejectedValue(error)
            },
            rawIdxState: {}
          } as unknown as IdxResponse;
          let errorThrown = false;
          try {
            await remediate(authClient, idxResponse, { resend: true }, {});
          } catch (e) {
            errorThrown = true;
            expect(e).toBe(error);
          }
          expect(errorThrown).toBe(true);
        });
      });

    });

    describe('action passed as string', () => {

      describe('action exists matching name', () => {
        it('executes the action specified by name, and calls remediate recursively', async () => {
          let { authClient, idxResponse } = testContext;
          const responseFromAction = {
            ...idxResponse,
            neededToProceed: [{
              name: 'another-remediation'
            }],
          };
          idxResponse = {
            ...idxResponse,
            neededToProceed: [{
              name: 'some-remediation'
            }],
            actions: {
              'some-action': jest.fn().mockReturnValue(responseFromAction)
            },
          } as unknown as IdxResponse;
          const res = await remediate(authClient, idxResponse, {}, { actions: ['some-action'], enableLegacyMode: true });
          expect(res).toEqual({
            idxResponse: {
              ...responseFromAction
            },
            nextStep: {}
          });
          expect(util.getRemediator).toHaveBeenCalledTimes(1);
          expect(util.getRemediator).toHaveBeenNthCalledWith(1, responseFromAction, {}, { actions: [], enableLegacyMode: true });
        });

        it('[New Mode] executes the action specified by name and returns response', async () => {
          let { authClient, idxResponse } = testContext;
          const responseFromAction = {
            ...idxResponse,
            neededToProceed: [{
              name: 'another-remediation'
            }],
          };
          idxResponse = {
            ...idxResponse,
            neededToProceed: [{
              name: 'some-remediation'
            }],
            actions: {
              'some-action': jest.fn().mockReturnValue(responseFromAction)
            },
          } as unknown as IdxResponse;
          const res = await remediate(authClient, idxResponse, {}, { actions: ['some-action'] });
          expect(res).toEqual({
            idxResponse: {
              ...responseFromAction
            },
            nextStep: {
              name: 'another-remediation'
            }
          });
          expect(util.getRemediator).toHaveBeenCalledTimes(0);
        });

        it('will handle exceptions', async () => {
          const { authClient } = testContext;
          const error = new Error('my test error');
          const idxResponse = {
            neededToProceed: [{
              name: 'some-remediation'
            }],
            actions: {
              'some-action': jest.fn().mockRejectedValue(error)
            },
            rawIdxState: {}
          } as unknown as IdxResponse;
          let errorThrown = false;
          try {
            await remediate(authClient, idxResponse, { resend: true }, { actions: ['some-action']});
          } catch (e) {
            errorThrown = true;
            expect(e).toBe(error);
          }
          expect(errorThrown).toBe(true);
        });
      });

      describe('no action matches the name', () => {
        it('proceeds with a remediation with a matching name', async () => {
          let { authClient, idxResponse } = testContext;
          const responseFromRemediation = {
            ...idxResponse,
            neededToProceed: [{
              name: 'another-remediation'
            }],
          };
          idxResponse = {
            ...idxResponse,
            proceed: jest.fn().mockResolvedValue(responseFromRemediation),
            neededToProceed: [{
              name: 'some-remediation'
            }],
          } as unknown as IdxResponse;
          const res = await remediate(authClient, idxResponse, {}, { actions: ['some-remediation'], enableLegacyMode: true });
          expect(res).toEqual({
            idxResponse: {
              ...responseFromRemediation
            },
            nextStep: {}
          });
          expect(util.getRemediator).toHaveBeenCalledTimes(1);
          expect(util.getRemediator).toHaveBeenNthCalledWith(1, responseFromRemediation, {}, { actions: [], enableLegacyMode: true });
        });

        it('[NEW MODE] proceeds with a remediation with a matching name to provided action', async () => {
          let { authClient, idxResponse } = testContext;
          const responseFromRemediation = {
            ...idxResponse,
            neededToProceed: [{
              name: 'another-remediation'
            }],
          };
          idxResponse = {
            ...idxResponse,
            proceed: jest.fn().mockResolvedValue(responseFromRemediation),
            neededToProceed: [{
              name: 'some-remediation'
            }],
          } as unknown as IdxResponse;
          const res = await remediate(authClient, idxResponse, {}, { actions: ['some-remediation'] });
          expect(res).toEqual({
            idxResponse: {
              ...responseFromRemediation
            },
            nextStep: { name: 'another-remediation' }
          });
          expect(util.getRemediator).toHaveBeenCalledTimes(0);
        });

        it('will handle exceptions', async () => {
          let { authClient, idxResponse } = testContext;
          const error = new Error('my test error');
          idxResponse = {
            ...idxResponse,
            proceed: jest.fn().mockRejectedValue(error),
            neededToProceed: [{
              name: 'some-remediation'
            }],
          } as unknown as IdxResponse;
          let errorThrown = false;
          try {
            await remediate(authClient, idxResponse, {}, { actions: ['some-remediation']});
          } catch (e) {
            errorThrown = true;
            expect(e).toBe(error);
          }
          expect(errorThrown).toBe(true);
        });
      });

      describe('no action or remedation matches the name provided', () => {
        beforeEach(() => {
          jest.spyOn(util, 'getRemediator').mockReturnValue(undefined);
          jest.spyOn(util, 'isTerminalResponse').mockReturnValue(false);
        });

        it('by default, it will throw an error', async () => {
          const { authClient, idxResponse } = testContext;
          let didThrow = false;
          try {
            await remediate(authClient, idxResponse, {}, { actions: ['unknown-action'], enableLegacyMode: true });
          } catch (err: any) {
            didThrow = true;
            expect(err.name).toEqual('AuthSdkError');
            expect(err.errorSummary).toContain('No remediation can match current flow, check policy settings in your org');
          }
          expect(didThrow).toBe(true);
        });

        it('[NEW MODE] by default, it will throw an error', async () => {
          const { authClient, idxResponse } = testContext;
          let didThrow = false;
          try {
            await remediate(authClient, idxResponse, {}, { actions: ['unknown-action'] });
          } catch (err: any) {
            didThrow = true;
            expect(err.name).toEqual('AuthSdkError');
            expect(err.errorSummary).toContain('Unable to proceed with provided actions');
          }
          expect(didThrow).toBe(true);
        });

        it('if flow is default, it will return the idxResponse', async () => {
          const { authClient, idxResponse } = testContext;
          const res = await remediate(authClient, idxResponse, {}, { flow: 'default', actions: ['unknown-action'], enableLegacyMode: true });
          expect(res).toEqual({ idxResponse });
        });
      });

    });

    describe('action passed as object', () => {

      describe('action exists matching name', () => {
        it('executes the action specified by name, passing the provided params, and calls remediate recursively', async () => {
          let { authClient, idxResponse } = testContext;
          const responseFromAction = {
            ...idxResponse,
            neededToProceed: [{
              name: 'another-remediation'
            }],
          };
          const actionFn = jest.fn().mockReturnValue(responseFromAction);
          idxResponse = {
            ...idxResponse,
            neededToProceed: [{
              name: 'some-remediation'
            }],
            actions: {
              'some-action': actionFn
            },
          } as unknown as IdxResponse;
          const action = {
            name: 'some-action',
            params: { foo: 'bar' }
          };
          const res = await remediate(authClient, idxResponse, {}, { actions: [action], enableLegacyMode: true });
          expect(actionFn).toHaveBeenCalledWith({ foo: 'bar' });
          expect(res).toEqual({
            idxResponse: {
              ...responseFromAction
            },
            nextStep: {}
          });
          expect(util.getRemediator).toHaveBeenCalledTimes(1);
          expect(util.getRemediator).toHaveBeenNthCalledWith(1, responseFromAction, {}, { actions: [], enableLegacyMode: true });
        });

        it('[NEW MODE] executes the action specified by name, passing the provided params and returns response', async () => {
          let { authClient, idxResponse } = testContext;
          const responseFromAction = {
            ...idxResponse,
            neededToProceed: [{
              name: 'another-remediation'
            }],
          };
          const actionFn = jest.fn().mockReturnValue(responseFromAction);
          idxResponse = {
            ...idxResponse,
            neededToProceed: [{
              name: 'some-remediation'
            }],
            actions: {
              'some-action': actionFn
            },
          } as unknown as IdxResponse;
          const action = {
            name: 'some-action',
            params: { foo: 'bar' }
          };
          const res = await remediate(authClient, idxResponse, {}, { actions: [action] });
          expect(actionFn).toHaveBeenCalledWith({ foo: 'bar' });
          expect(res).toEqual({
            idxResponse: {
              ...responseFromAction
            },
            nextStep: { name: 'another-remediation' }
          });
          expect(util.getRemediator).toHaveBeenCalledTimes(0);
        });

        it('will handle exceptions', async () => {
          let { authClient, idxResponse } = testContext;
          const error = new Error('my test error');
          const actionFn = jest.fn().mockRejectedValue(error);
          idxResponse = {
            ...idxResponse,
            neededToProceed: [{
              name: 'some-remediation'
            }],
            actions: {
              'some-action': actionFn
            },
          } as unknown as IdxResponse;
          const action = {
            name: 'some-action',
            params: { foo: 'bar' }
          };
          let errorThrown = false;
          try {
            await remediate(authClient, idxResponse, {}, { actions: [action]});
          } catch (e) {
            errorThrown = true;
            expect(e).toBe(error);
          }
          expect(errorThrown).toBe(true);
          expect(actionFn).toHaveBeenCalledWith({ foo: 'bar' });
        });
      });

      describe('no action matches the name', () => {
        it('proceeds with a remediation with a matching name, passing the provided params', async () => {
          let { authClient, idxResponse } = testContext;
          const responseFromRemediation = {
            ...idxResponse,
            neededToProceed: [{
              name: 'another-remediation'
            }],
          };
          idxResponse = {
            ...idxResponse,
            proceed: jest.fn().mockResolvedValue(responseFromRemediation),
            neededToProceed: [{
              name: 'some-remediation'
            }],
          } as unknown as IdxResponse;
          const action = {
            name: 'some-remediation'
          };
          const res = await remediate(authClient, idxResponse, {}, { actions: [action], enableLegacyMode: true });
          expect(res).toEqual({
            idxResponse: {
              ...responseFromRemediation
            },
            nextStep: {}
          });
          expect(util.getRemediator).toHaveBeenCalledTimes(1);
          expect(util.getRemediator).toHaveBeenNthCalledWith(1, responseFromRemediation, {}, { actions: [], enableLegacyMode: true });
        });

        it('[NEW MODE] proceeds with a remediation with a matching name, passing the provided params', async () => {
          let { authClient, idxResponse } = testContext;
          const responseFromRemediation = {
            ...idxResponse,
            neededToProceed: [{
              name: 'another-remediation'
            }],
          };
          idxResponse = {
            ...idxResponse,
            proceed: jest.fn().mockResolvedValue(responseFromRemediation),
            neededToProceed: [{
              name: 'some-remediation'
            }],
          } as unknown as IdxResponse;
          const action = {
            name: 'some-remediation'
          };
          const res = await remediate(authClient, idxResponse, {}, { actions: [action] });
          expect(res).toEqual({
            idxResponse: {
              ...responseFromRemediation
            },
            nextStep: { name: 'another-remediation' }
          });
          expect(util.getRemediator).toHaveBeenCalledTimes(0);
        });

        it('will handle exceptions', async () => {
          let { authClient, idxResponse } = testContext;
          const error = new Error('my test error');
          idxResponse = {
            ...idxResponse,
            proceed: jest.fn().mockRejectedValue(error),
            neededToProceed: [{
              name: 'some-remediation'
            }],
          } as unknown as IdxResponse;
          const action = {
            name: 'some-remediation'
          };
          let errorThrown = false;
          try {
            await remediate(authClient, idxResponse, {}, { actions: [action]});
          } catch (e) {
            errorThrown = true;
            expect(e).toBe(error);
          }
          expect(errorThrown).toBe(true);
        });
      });

      describe('no action or remedation matches the action name provided', () => {
        it('it will throw an error', async () => {
          const { authClient, idxResponse } = testContext;
          let didThrow = false;
          jest.spyOn(util, 'getRemediator').mockReturnValue(undefined);
          jest.spyOn(util, 'isTerminalResponse').mockReturnValue(false);
          const action = {
            name: 'unknown-action'
          };
          try {
            await remediate(authClient, idxResponse, {}, { actions: [action], enableLegacyMode: true });
          } catch (err: any) {
            didThrow = true;
            expect(err.name).toEqual('AuthSdkError');
            expect(err.errorSummary).toContain('No remediation can match current flow, check policy settings in your org');
          }
          expect(didThrow).toBe(true);
        });

        it('[NEW MODE] it will throw an error', async () => {
          const { authClient, idxResponse } = testContext;
          let didThrow = false;
          jest.spyOn(util, 'getRemediator').mockReturnValue(undefined);
          jest.spyOn(util, 'isTerminalResponse').mockReturnValue(false);
          const action = {
            name: 'unknown-action'
          };
          try {
            await remediate(authClient, idxResponse, {}, { actions: [action] });
          } catch (err: any) {
            didThrow = true;
            expect(err.name).toEqual('AuthSdkError');
            expect(err.errorSummary).toContain('Unable to proceed with provided actions');
          }
          expect(didThrow).toBe(true);
        });
      });
    });
  });

  describe('no remediator matches', () => {
    beforeEach(() => {
      jest.spyOn(util, 'getRemediator').mockReturnValue(undefined);
      jest.spyOn(util, 'isTerminalResponse').mockReturnValue(false);
    });

    it('by default, it throws an exception', async () => {
      const { authClient, idxResponse } = testContext;
      let didThrow = false;
      try {
        await remediate(authClient, idxResponse, {}, { actions: ['unknown-action'], enableLegacyMode: true });
      } catch (err: any) {
        didThrow = true;
        expect(err.name).toEqual('AuthSdkError');
        expect(err.errorSummary).toContain('No remediation can match current flow, check policy settings in your org');
      }
      expect(didThrow).toBe(true);
    });

    it('[NEW MODE] by default, it throws an exception', async () => {
      const { authClient, idxResponse } = testContext;
      let didThrow = false;
      try {
        await remediate(authClient, idxResponse, {}, { actions: ['unknown-action'] });
      } catch (err: any) {
        didThrow = true;
        expect(err.name).toEqual('AuthSdkError');
        expect(err.errorSummary).toContain('Unable to proceed with provided actions');
      }
      expect(didThrow).toBe(true);
    });

    describe('options.step was provided', () => {
      it('will execute the named remediation provided by options.step', async () => {
        let { authClient, idxResponse } = testContext;
        const responseFromRemediation = {
          ...idxResponse,
          neededToProceed: [{
            name: 'another-remediation'
          }],
        };
        idxResponse = {
          ...idxResponse,
          proceed: jest.fn().mockResolvedValue(responseFromRemediation),
          neededToProceed: [{
            name: 'some-remediation',
            value: [{
              name: 'foo'
            }]
          }],
        } as unknown as IdxResponse;
        const res = await remediate(authClient, idxResponse, {}, { step: 'some-remediation', enableLegacyMode: true });
        expect(res).toEqual({
          idxResponse: {
            ...responseFromRemediation
          },
        });
        expect(util.getRemediator).toHaveBeenCalledTimes(1);
        expect(util.getRemediator).toHaveBeenNthCalledWith(1, idxResponse, {}, { step: 'some-remediation', enableLegacyMode: true });
        expect(idxResponse.proceed).toHaveBeenCalledWith('some-remediation', {});
      });

      it('[NEW MODE] will execute the named remediation provided by options.step', async () => {
        let { authClient, idxResponse } = testContext;
        const responseFromRemediation = {
          ...idxResponse,
          neededToProceed: [{
            name: 'another-remediation'
          }],
        };
        idxResponse = {
          ...idxResponse,
          proceed: jest.fn().mockResolvedValue(responseFromRemediation),
          neededToProceed: [{
            name: 'some-remediation',
            value: [{
              name: 'foo'
            }]
          }],
        } as unknown as IdxResponse;
        const res = await remediate(authClient, idxResponse, {}, { step: 'some-remediation' });
        expect(res).toEqual({
          idxResponse: {
            ...responseFromRemediation,
          },
          nextStep: {
            name: 'another-remediation'
          }
        });
        expect(util.getRemediator).toHaveBeenCalledTimes(1);
        expect(util.getRemediator).toHaveBeenNthCalledWith(1, idxResponse, {}, { step: 'some-remediation' });
        expect(idxResponse.proceed).toHaveBeenCalledWith('some-remediation', {});
      });

      it('will handle exceptions', async () => {
        let { authClient, idxResponse } = testContext;
        const error = new Error('my test error');
        idxResponse = {
          ...idxResponse,
          proceed: jest.fn().mockRejectedValue(error),
          neededToProceed: [{
            name: 'some-remediation',
            value: [{
              name: 'foo'
            }]
          }],
        } as unknown as IdxResponse;
        let errorThrown = false;
        try {
          await remediate(authClient, idxResponse, {}, { step: 'some-remediation', enableLegacyMode: true });
        } catch (e) {
          errorThrown = true;
          expect(e).toBe(error);
        }
        expect(errorThrown).toBe(true);
        expect(idxResponse.proceed).toHaveBeenCalledWith('some-remediation', {});
      });

      it('[NEW MODE] will handle exceptions', async () => {
        let { authClient, idxResponse } = testContext;
        const error = new Error('my test error');
        idxResponse = {
          ...idxResponse,
          proceed: jest.fn().mockRejectedValue(error),
          neededToProceed: [{
            name: 'some-remediation',
            value: [{
              name: 'foo'
            }]
          }],
        } as unknown as IdxResponse;
        let errorThrown = false;
        try {
          await remediate(authClient, idxResponse, {}, { step: 'some-remediation' });
        } catch (e) {
          errorThrown = true;
          expect(e).toBe(error);
        }
        expect(errorThrown).toBe(true);
        expect(idxResponse.proceed).toHaveBeenCalledWith('some-remediation', {});
      });
    });

    describe('flow is "default"', () => {
      it('returns the idxResponse', async () => {
        const { authClient, idxResponse } = testContext;
        const res = await remediate(authClient, idxResponse, {}, { flow: 'default', enableLegacyMode: true });
        expect(res).toEqual({ idxResponse });
      });
    });
  });

  describe('with matching remediator', () => {
    beforeEach(() => {
      let { idxResponse } = testContext;
      idxResponse = {
        ...idxResponse,
        neededToProceed: [{
          name: 'some-remediation'
        }]
      };
      testContext = {
        ...testContext,
        idxResponse
      };
    });

    it('[NEW MODE] throws error is a `step` is not provided without legacyMode flag', async () => {
      expect.assertions(3);   // ensures expected error is throw and `catch` is reached

      const { authClient, idxResponse, remediator } = testContext;
      remediator.canRemediate.mockReturnValue(false);
      try {
        await remediate(authClient, idxResponse, {}, {});
      }
      catch (err) {
        expect((err as any).name).toEqual('AuthSdkError');
        expect((err as any).errorSummary).toContain('No `step` or `action` provided');
      }
      expect(remediator.canRemediate).not.toHaveBeenCalled();
    });

    it('if the Remediator cannot remediate, it returns early with nextStep information', async () => {
      const { authClient, idxResponse, remediator } = testContext;
      remediator.canRemediate.mockReturnValue(false);
      const res = await remediate(authClient, idxResponse, {}, { enableLegacyMode: true });
      expect(res).toEqual({
        idxResponse,
        nextStep: {}
      });
      expect(remediator.canRemediate).toHaveBeenCalled();
    });

    describe('canRemediate', () => {
      beforeEach(() => {
        let { remediator } = testContext;
        jest.spyOn(util, 'isTerminalResponse');
        const name = 'fubar';
        const data = { foo: 'bar' };
        const valuesAfterProceed = { zomething: 'zifferent' };
        remediator.canRemediate.mockReturnValueOnce(true);
        remediator.getName.mockReturnValue(name);
        remediator.getData.mockReturnValue(data);
        remediator.getValuesAfterProceed.mockReturnValue(valuesAfterProceed);
        testContext = {
          ...testContext,
          name,
          data,
          valuesAfterProceed
        };
      });
      it('calls proceed with data from the Remediator, then calls remediate recursively using values from the Remediator', async () => {
        let { authClient, idxResponse, name, data, valuesAfterProceed } = testContext;
        const responseFromProceed = {
          ...idxResponse,
          rawIdxState: {
            messages: {
              value: ['hello']
            }
          }
        };
        idxResponse.proceed.mockResolvedValue(responseFromProceed);
        const res = await remediate(authClient, idxResponse, {}, { enableLegacyMode: true });
        expect(res).toEqual({
          idxResponse: {
            ...responseFromProceed
          },
          nextStep: {}
        });
        expect(idxResponse.proceed).toHaveBeenCalledWith(name, data);
        expect(util.getRemediator).toHaveBeenCalledTimes(2);
        expect(util.getRemediator).toHaveBeenNthCalledWith(1, idxResponse, {}, { enableLegacyMode: true });
        expect(util.getRemediator).toHaveBeenNthCalledWith(2, responseFromProceed, valuesAfterProceed, { enableLegacyMode: true });

      });

      it('will bubble up thrown exceptions', async () => {
        let { authClient, idxResponse, remediator } = testContext;
        jest.spyOn(util, 'isTerminalResponse');
        const name = 'fubar';
        const data = { foo: 'bar' };
        const valuesAfterProceed = { zomething: 'zifferent' };
        remediator.canRemediate.mockReturnValue(true);
        remediator.getName.mockReturnValue(name);
        remediator.getData.mockReturnValue(data);
        remediator.getValuesAfterProceed.mockReturnValue(valuesAfterProceed);
        const errorFromProceed = new Error('test error');
        idxResponse.proceed.mockRejectedValue(errorFromProceed);
        let errorThrown;
        try {
          await remediate(authClient, idxResponse, {}, { enableLegacyMode: true });
        } catch (e) {
          errorThrown = e;
        }
        expect(errorThrown).toBe(errorFromProceed);
        expect(idxResponse.proceed).toHaveBeenCalledWith(name, data);
        expect(util.isTerminalResponse).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('use generic remediator', () => {
    it('returns nextStep without auto proceeding in pending status', async () => {
      let { authClient, idxResponse, remediator } = testContext;
      const idxResponseInput = {
        ...idxResponse,
        neededToProceed: [{
          name: 'some-remediation'
        }]
      };
      // response in pending status
      const responseFromProceed = {
        ...idxResponse,
        neededToProceed: [{
          name: 'some-new-remediation'
        }]
      };
      idxResponse.proceed.mockResolvedValue(responseFromProceed);
      remediator.canRemediate.mockReturnValue(true);
      await remediate(authClient, idxResponseInput, {}, { useGenericRemediator: true, enableLegacyMode: true });
      expect(idxResponse.proceed).toHaveBeenCalledTimes(1);
    });

    it('[NEW MODE] returns nextStep without auto proceeding in pending status', async () => {
      let { authClient, idxResponse, remediator } = testContext;
      const idxResponseInput = {
        ...idxResponse,
        neededToProceed: [{
          name: 'some-remediation'
        }]
      };
      // response in pending status
      const responseFromProceed = {
        ...idxResponse,
        neededToProceed: [{
          name: 'some-new-remediation'
        }]
      };
      idxResponse.proceed.mockResolvedValue(responseFromProceed);
      remediator.canRemediate.mockReturnValue(true);
      await remediate(authClient, idxResponseInput, {}, { useGenericRemediator: true });
      expect(idxResponse.proceed).toHaveBeenCalledTimes(1);
    });

    it('returns terminal status with terminal response', async () => {
      let { authClient, idxResponse, remediator } = testContext;
      const idxResponseInput = {
        ...idxResponse,
        neededToProceed: [{
          name: 'some-remediation'
        }]
      };
      // response in terminal status
      const responseFromProceed = {
        ...idxResponse,
        rawIdxState: {
          messages: {
            value: ['hello']
          }
        }
      };
      idxResponse.proceed.mockResolvedValue(responseFromProceed);
      remediator.canRemediate.mockReturnValue(true);
      const res = await remediate(authClient, idxResponseInput, {}, { useGenericRemediator: true, enableLegacyMode: true });
      expect(idxResponse.proceed).toHaveBeenCalledTimes(1);
      expect(remediator.getNextStep).toHaveBeenCalledTimes(0);
      expect(res).toEqual({
        idxResponse: {
          ...responseFromProceed,
        },
        terminal: true,
      });
    });

    it('[NEW MODE] returns terminal status with terminal response', async () => {
      let { authClient, idxResponse, remediator } = testContext;
      const idxResponseInput = {
        ...idxResponse,
        neededToProceed: [{
          name: 'some-remediation'
        }]
      };
      // response in terminal status
      const responseFromProceed = {
        ...idxResponse,
        rawIdxState: {
          messages: {
            value: ['hello']
          }
        }
      };
      idxResponse.proceed.mockResolvedValue(responseFromProceed);
      remediator.canRemediate.mockReturnValue(true);
      const res = await remediate(authClient, idxResponseInput, {}, { useGenericRemediator: true });
      expect(idxResponse.proceed).toHaveBeenCalledTimes(1);
      expect(remediator.getNextStep).toHaveBeenCalledTimes(0);
      expect(res).toEqual({
        idxResponse: {
          ...responseFromProceed,
        },
        terminal: true,
      });
    });
  });
});
