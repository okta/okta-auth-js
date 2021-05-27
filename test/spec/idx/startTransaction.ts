import { startTransaction } from '../../../lib/idx/startTransaction';
import { IdxFeature, IdxStatus } from '../../../lib/idx/types';

import { 
  IdxResponseFactory,
  SelectEnrollProfileRemediationFactory,
  RedirectIdpRemediationFactory,
  IdentifyRemediationFactory
} from '@okta/test.support/idx';

const mocked = {
  interact: require('../../../lib/idx/interact'),
  introspect: require('../../../lib/idx/introspect'),
  remediate: require('../../../lib/idx/remediate')
};

describe('idx/startTransaction', () => {
  let testContext;

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
      ignoreSignature: true,
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

    const idxResponse = IdxResponseFactory.build();
    jest.spyOn(mocked.interact, 'interact').mockResolvedValue({
      meta: transactionMeta,
      interactionHandle: 'meta-interactionHandle',
      state: transactionMeta.state
    });
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idxResponse);
    jest.spyOn(mocked.remediate, 'remediate').mockResolvedValue({});

    testContext = {
      issuer,
      clientId,
      redirectUri,
      stateHandle,
      transactionMeta,
      authClient
    };
  });

  it('calls interact, introspect, but not remediate', async () => {
    const { authClient } = testContext;
    await startTransaction(authClient);
    expect(mocked.interact.interact).toHaveBeenCalledWith(authClient, {});
    expect(mocked.introspect.introspect).toHaveBeenCalledWith(authClient, { 
      interactionHandle: 'meta-interactionHandle' 
    });
    expect(mocked.remediate.remediate).not.toHaveBeenCalled();
  });

  it('returns transaction in pending status', async () => {
    const { authClient } = testContext;
    const res = await startTransaction(authClient);
    expect(res.status).toEqual(IdxStatus.PENDING);
  });

  it('has password-recovery feature enabled with currentAuthenticator-recover action', async () => {
    const idxResponse = IdxResponseFactory.build({
      actions: { 
        'currentAuthenticator-recover': (() => {}) as Function
      }
    });
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idxResponse);
    const { authClient } = testContext;
    const res = await startTransaction(authClient);
    expect(res.enabledFeatures.includes(IdxFeature.PASSWORD_RECOVERY)).toBeTruthy();
  });

  it('has registration feature enabled with RegistrationEnabledResponseFactory', async () => {
    const idxResponse = IdxResponseFactory.build({
      neededToProceed: [
        SelectEnrollProfileRemediationFactory.build()
      ]
    });
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idxResponse);
    const { authClient } = testContext;
    const res = await startTransaction(authClient);
    expect(res.enabledFeatures.includes(IdxFeature.REGISTRATION)).toBeTruthy();
  });

  it('has social idp feature enabled with SocialIDPEnabledResponseFactory', async () => {
    const idxResponse = IdxResponseFactory.build({
      neededToProceed: [
        RedirectIdpRemediationFactory.build()
      ]
    });
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idxResponse);
    const { authClient } = testContext;
    const res = await startTransaction(authClient);
    expect(res.enabledFeatures.includes(IdxFeature.SOCIAL_IDP)).toBeTruthy();
  });

  it('maps remediations to availableSteps', async () => {
    const idxResponse = IdxResponseFactory.build({
      neededToProceed: [
        IdentifyRemediationFactory.build(),
        SelectEnrollProfileRemediationFactory.build()
      ]
    });
    jest.spyOn(mocked.introspect, 'introspect').mockResolvedValue(idxResponse);
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
