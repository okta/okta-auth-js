import { TokenServiceInterface } from './TokenService';

// only add methods needed internally
export interface ServiceManagerInterface {
  isLeader(): boolean;
  start(): void;
  stop(): void;
  getService(name: string): TokenServiceInterface | undefined;
}
