import { interact } from './interact';
import { OktaAuth, IdxOptions, IdxTransaction, IdxStatus } from '../types';

export async function startTransaction(
  authClient: OktaAuth, 
  options: IdxOptions
): Promise<IdxTransaction> {
  // TODO: call run to return IdxTransaction
  const {
    meta,
  } = await interact(authClient, options);
  return { status: IdxStatus.PENDING, meta };
}
