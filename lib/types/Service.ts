// only add methods needed internally
export interface ServiceInterface {
  start(): void;
  stop(): void;
  isStarted(): boolean;
  canStart(): boolean;
  requiresLeadership(): boolean;
}

export interface ServiceManagerInterface {
  isLeader(): boolean;
  start(): Promise<void>;
  stop(): Promise<void>;
  getService(name: string): ServiceInterface | undefined;
}

export interface AutoRenewServiceOptions {
  autoRenew?: boolean;
  autoRemove?: boolean;
}

export interface SyncStorageServiceOptions {
  syncStorage?: boolean;
  syncChannelName?: string;
}

export interface LeaderElectionServiceOptions {
  electionChannelName?: string;
  // TODO: remove in next major version - OKTA-473815
  broadcastChannelName?: string;
}

export type ServiceManagerOptions = AutoRenewServiceOptions &
  SyncStorageServiceOptions & LeaderElectionServiceOptions;
