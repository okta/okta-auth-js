export type FlowIdentifier = 'default'
  | 'proceed'
// idx.authenticate
  | 'authenticate'
  | 'login'
  | 'signin'
// idx.register
  | 'register'
  | 'signup'
  | 'enrollProfile'
// idx.recoverPassword
  | 'recoverPassword'
  | 'resetPassword'
// idx.unlockAccount
  | 'unlockAccount'
// BETA - flow to use GenericRemediator
// This flow identifier is subject to change in the current major version
  | 'generic';
