import { OktaAuthOptions, ServiceInterface } from './types';
import { AutoRenewService, SyncStorageService } from './services';
import { OktaAuth } from '.';


export class ServiceManager {
  private _sdk: OktaAuth;
  private _options: OktaAuthOptions;
  private _services: ServiceInterface[];

  constructor (sdk: OktaAuth) {
    this._sdk = sdk;
    this._services = [];
    this._options = { ...sdk.options, tokenManager: sdk.tokenManager.getOptions() };
  }

  get options() {
    return {...this.options};
  }

  start() {
    if (this._services.length > 0) {
      this.stop();
    }

    const tokenManagerOptions = this._options.tokenManager;

    if (tokenManagerOptions?.autoRenew) {
      const autoRenewService = new AutoRenewService(this._sdk.tokenManager, {...tokenManagerOptions});
      autoRenewService.start();
      this._services.push(autoRenewService);
    }

    if (tokenManagerOptions?.syncStorage) {
      const syncStorageService = new SyncStorageService(this._sdk.tokenManager, {...tokenManagerOptions});
      syncStorageService.start();
      this._services.push(syncStorageService);
    }
  }
  
  stop() {
    this._services.map(s => s.stop());
  }
}