export class TransactionState {
  stateToken?: string;
  autoPush?: boolean | Function;
  rememberDevice?: boolean | Function;
  profile?: {
    updatePhone?: boolean;
  };
}