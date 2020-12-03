export class TransactionState {
  stateToken?: string;
  type?: string;
  expiresAt?: string;
  relayState?: string;
  factorResult?: string;
  factorType?: string;
  recoveryToken?: string;
  recoveryType?: string;
  autoPush?: boolean | Function;
  rememberDevice?: boolean | Function;
  profile?: {
    updatePhone?: boolean;
  };
}