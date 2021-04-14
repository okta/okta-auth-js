import { AuthTransaction } from '../tx';
import { 
  OktaAuth, 
  PasswordRecoveryOptions,
  RemediatorFlow
} from '../types';
import { run } from './run';

export async function recoverPassword(
  authClient: OktaAuth, options: PasswordRecoveryOptions
): Promise<AuthTransaction> {
  return run(authClient, { 
    ...options, 
    flow: RemediatorFlow.PasswordRecovery,
    needInteraction: true,
    actionPath: 'currentAuthenticator-recover',
  });
}
