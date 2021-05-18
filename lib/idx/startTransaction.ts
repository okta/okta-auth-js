import { run } from './run';
import { OktaAuth, IdxOptions, IdxTransaction } from '../types';

export async function startTransaction(
  authClient: OktaAuth, 
  options: IdxOptions
): Promise<IdxTransaction> {
  return run(authClient, options);
}
