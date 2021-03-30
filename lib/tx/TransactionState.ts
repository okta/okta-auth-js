export class TransactionState {
  interactionHandle?: string;

// Authn V1 only
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