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
    this.maybeAddNodeEnvironment();
    return { 'X-Okta-User-Agent-Extended': this.environments.join(' ') };
  }

  private maybeAddNodeEnvironment() {
    if (isBrowser() || !process || !process.versions) {
      return;
    }
    const { node: version } = process.versions;
    this.environments.push(`nodejs/${version}`);
  }
}
