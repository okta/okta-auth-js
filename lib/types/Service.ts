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
  start(): void;
  stop(): void;
  getService(name: string): ServiceInterface | undefined;
}

export interface AutoRenewServiceOptions {
  autoRenew?: boolean;
  autoRemove?: boolean;
}

export interface SyncStorageServiceOptions {
  syncStorage?: boolean;
}

export type ServiceManagerOptions = AutoRenewServiceOptions &
  SyncStorageServiceOptions & 
  {
    broadcastChannelName?: string;
  };
