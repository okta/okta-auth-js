import { run } from './run';
import { OktaAuth, IdxOptions, IdxTransaction } from '../types';

// This method only resolves { status: IdxStatus.PENDING } if transaction has already started
export async function startTransaction(
  authClient: OktaAuth, 
  options: IdxOptions = {}
): Promise<IdxTransaction> {
  return run(authClient, options);
}
