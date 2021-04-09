import { AuthTransaction } from '../tx';
import { OktaAuth, RegistrationOptions, RemediatorFlow } from '../types';
import { run } from './run';

export async function registration(
  authClient: OktaAuth, options: RegistrationOptions
): Promise<AuthTransaction> {
  return run(authClient, { 
    ...options, 
    flow: RemediatorFlow.Registration,
    needInteraction: true 
  });
}
