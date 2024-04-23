import { ServiceInterface, ServiceManagerOptions } from '../core/types';
import { TokenManagerInterface } from '../oidc/types';
import { isBrowser } from '../features';

const getNow = () => Math.floor(Date.now() / 1000);

export class RenewOnTabActivationService implements ServiceInterface {
  private tokenManager: TokenManagerInterface;
  private started = false;
  private options: ServiceManagerOptions;
  private lastHidden = -1;
  onPageVisbilityChange: () => void;

  constructor(tokenManager: TokenManagerInterface, options: ServiceManagerOptions = {}) {
    this.tokenManager = tokenManager;
    this.options = options;
    // store this context for event handler
    this.onPageVisbilityChange = this._onPageVisbilityChange.bind(this);
  }

  // do not use directly, use `onPageVisbilityChange` (with binded this context)
  /* eslint complexity: [0, 10] */
  private _onPageVisbilityChange () {
    if (document.hidden) {
      this.lastHidden = getNow();
    }
    // renew will only attempt if tab was inactive for duration
    else if (this.lastHidden > 0 && (getNow() - this.lastHidden >= this.options.tabInactivityDuration!)) {
      const { accessToken, idToken } = this.tokenManager.getTokensSync();
      if (!!accessToken && this.tokenManager.hasExpired(accessToken)) {
        const key = this.tokenManager.getStorageKeyByType('accessToken');
        // Renew errors will emit an "error" event
        this.tokenManager.renew(key).catch(() => {});
      }
      else if (!!idToken && this.tokenManager.hasExpired(idToken)) {
        const key = this.tokenManager.getStorageKeyByType('idToken');
        // Renew errors will emit an "error" event
        this.tokenManager.renew(key).catch(() => {});
      }
    }
  }

  async start () {
    if (this.canStart() && !!document) {
      document.addEventListener('visibilitychange', this.onPageVisbilityChange);
      this.started = true;
    }
  }

  async stop () {
    if (document) {
      document.removeEventListener('visibilitychange', this.onPageVisbilityChange);
      this.started = false;
    }
  }

  canStart(): boolean {
    return isBrowser() &&
    !!this.options.autoRenew &&
    !!this.options.renewOnTabActivation &&
    !this.started;
  }

  requiresLeadership(): boolean {
    return false;
  }

  isStarted(): boolean {
    return this.started;
  }
}
