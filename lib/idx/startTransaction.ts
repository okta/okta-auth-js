import { run } from './run';
import { FlowMonitor } from './flowMonitors';
import { OktaAuth, IdxOptions, IdxTransaction } from '../types';

export async function startTransaction(
  authClient: OktaAuth, 
  options: IdxOptions
): Promise<IdxTransaction> {
  const flowMonitor = new FlowMonitor();
  return run(authClient, { ...options, flowMonitor });
}
