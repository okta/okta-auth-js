export interface ServiceInterface {
  start: () => void;
  stop: () => void;
};

export interface AutoRenewServiceOptions {
  activeAutoRenew?: boolean;
  autoRemove?: boolean;
}

export interface SyncStorageServiceOptions {
  syncStorage?: boolean;
}

export type ServiceManagerOptions = AutoRenewServiceOptions &
  SyncStorageServiceOptions
