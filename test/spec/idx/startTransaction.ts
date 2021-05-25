import { startTransaction } from '../../../lib/idx/startTransaction';
import { IdxFeature, IdxStatus } from '../../../lib/idx/types';

import { 
  PasswordRecoveryEnabledResponseFactory,
  RegistrationEnabledResponseFactory,
  SocialIDPEnabledResponseFactory,
  AvailableStepsResponseFactory,
} from '@okta/test.support/idx';

const mocked = {
  interact: require('../../../lib/idx/interact'),
  remediate: require('../../../lib/idx/remediate')
};

describe('idx/startTransaction', () => {
  let testContext;
  let interactResponse;

  beforeEach(() => {
    const stateHandle = 'test-stateHandle';

    const issuer = 'test-issuer';
    const clientId = 'test-clientId';
    const redirectUri = 'test-redirectUri';
    const transactionMeta = {
      issuer,
      clientId,
      redirectUri,
      state: 'meta-state',
      codeVerifier: 'meta-code',
      scopes: ['meta'],
      urls: { authorizeUrl: 'meta-authorizeUrl' },
      ignoreSignature: true
    };
    const authClient = {
      options: {
        issuer,
        clientId,
        redirectUri
      },
      transactionManager: {
        exists: () => true,
        load: () => transactionMeta,
        clear: () => {},
        save: () => {}
      },
    };

    interactResponse = {
      idxResponse: {
        actions: {},
        neededToProceed: []
      },
      meta: transactionMeta,
      stateHandle: 'idx-stateHandle'
    };
    jest.spyOn(mocked.interact, 'interact').mockImplementation(() => Promise.resolve(interactResponse));
    jest.spyOn(mocked.remediate, 'remediate').mockImplementation(() => {});

    testContext = {
      issuer,
      clientId,
      redirectUri,
      stateHandle,
      transactionMeta,
      authClient
    };
  });

  it('calls only interact', async () => {
    const { authClient } = testContext;
    await startTransaction(authClient);
    expect(mocked.interact.interact).toHaveBeenCalledWith(authClient, {});
    expect(mocked.remediate.remediate).not.toHaveBeenCalled();
  });

  it('returns transaction in pending status', async () => {
    const { authClient } = testContext;
    const res = await startTransaction(authClient);
    expect(res.status).toEqual(IdxStatus.PENDING);
  });

  it('has password-recovery feature enabled with PasswordRecoveryEnabledResponseFactory', async () => {
    interactResponse = {
      idxResponse: PasswordRecoveryEnabledResponseFactory.build(),
      stateHandle: 'idx-stateHandle'
    };
    const { authClient } = testContext;
    const res = await startTransaction(authClient);
    expect(res.enabledFeatures.includes(IdxFeature.PASSWORD_RECOVERY)).toBeTruthy();
  });

  it('has registration feature enabled with RegistrationEnabledResponseFactory', async () => {
    interactResponse = {
      idxResponse: RegistrationEnabledResponseFactory.build(),
      stateHandle: 'idx-stateHandle'
    };
    const { authClient } = testContext;
    const res = await startTransaction(authClient);
    expect(res.enabledFeatures.includes(IdxFeature.REGISTRATION)).toBeTruthy();
  });

  it('has social idp feature enabled with SocialIDPEnabledResponseFactory', async () => {
    interactResponse = {
      idxResponse: SocialIDPEnabledResponseFactory.build(),
      stateHandle: 'idx-stateHandle'
    };
    const { authClient } = testContext;
    const res = await startTransaction(authClient);
    expect(res.enabledFeatures.includes(IdxFeature.SOCIAL_IDP)).toBeTruthy();
  });

  it('maps remediations to availableSteps', async () => {
    interactResponse = {
      idxResponse: AvailableStepsResponseFactory.build(),
      stateHandle: 'idx-stateHandle'
    };
    const { authClient } = testContext;
    const res = await startTransaction(authClient);
    expect(res.availableSteps).toEqual([
      {
        inputs: [
          { label: 'Username', name: 'username' }
        ], 
        name: 'identify'
      }, 
      {
        inputs: [], 
        name: 'select-enroll-profile'
      }
    ]);
  });

  it('exposes transaction meta in the response', async () => {
    const { authClient, transactionMeta } = testContext;
    const res = await startTransaction(authClient);
    expect(res.meta).toEqual(transactionMeta);
  });

});
