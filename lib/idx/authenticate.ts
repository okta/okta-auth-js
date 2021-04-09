import { AuthTransaction } from '../tx';
import { 
  OktaAuth, 
  AuthenticationRemediationValues,
  RemediatorFlow,
  RunOptions
} from '../types';
import { run } from './run';

export async function authenticate(
  authClient: OktaAuth, options: RunOptions | AuthenticationRemediationValues
): Promise<AuthTransaction> {
  return run(authClient, { 
    ...options, 
    flow: RemediatorFlow.Authenticate,
    needInteraction: false 
  });
}
