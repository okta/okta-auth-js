import { AuthTransaction } from '../tx';
import { interact } from './interact';
import { OktaAuth, InteractOptions } from '../types';

export async function startAuthTransaction(
  authClient: OktaAuth, 
  options: InteractOptions
): Promise<AuthTransaction> {
  const {
    interactionHandle,
    meta,
  } = await interact(authClient, options);
  const authTransaction = new AuthTransaction(authClient, {
    interactionHandle,
    meta
  });
  return authTransaction;
}
