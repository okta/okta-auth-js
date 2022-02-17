export interface TokenServiceInterface {
  start(): void;
  stop(): void;
  isStarted(): boolean;
  canStart(): boolean;
  requiresLeadership(): boolean;
}
