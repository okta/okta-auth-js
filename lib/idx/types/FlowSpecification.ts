import { FlowIdentifier } from './FlowIdentifier';
import type { RemediationFlow } from '../flow/RemediationFlow';

export interface FlowSpecification {
  flow: FlowIdentifier;
  remediators: RemediationFlow;
  actions?: string[];
  withCredentials?: boolean;
}
