/* global SDK_VERSION */
import { isBrowser } from './features';

export class OktaUserAgent {
  private environments: string[];

  constructor() {
    // add base sdk env
    this.environments = [`okta-auth-js/${SDK_VERSION}`];
  }

  addEnvironment(env: string) {
    this.environments.push(env);
  }

  getHttpHeader() {
    const header = this.getHeaderName();
    this.maybeAddNodeEnvironment();
    return { [header]: this.environments.join(' ') };
  }

  private getHeaderName() {
    return isBrowser() ? 'X-Okta-User-Agent-Extended' : 'User-Agent';
  }

  private maybeAddNodeEnvironment() {
    if (isBrowser()) {
      return;
    }
    const { node: version } = process.versions;
    this.environments.push(`nodejs/${version}`);
  }
}
