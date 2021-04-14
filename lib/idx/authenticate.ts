import { AuthTransaction } from '../tx';
import { 
  OktaAuth, 
  AuthenticationOptions,
  RemediatorFlow
} from '../types';
import { run } from './run';

export async function authenticate(
  authClient: OktaAuth, options: AuthenticationOptions
): Promise<AuthTransaction> {
  return run(authClient, { 
    ...options, 
    flow: RemediatorFlow.Authentication,
    needInteraction: false 
  });
}
