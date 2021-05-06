import { AuthTransaction } from '../tx';
import { interact } from './interact';
import { OktaAuth, IdxOptions } from '../types';

export async function startAuthTransaction(
  authClient: OktaAuth, 
  options: IdxOptions
): Promise<AuthTransaction> {
  const {
    meta,
  } = await interact(authClient, options);
  const authTransaction = new AuthTransaction(authClient, meta);
  return authTransaction;
}
