
import fetch from 'cross-fetch';
import { getConfig } from '../../util/configUtils';
import waitForOneSecond from '../wait/waitForOneSecond';

const PROFILE_URL = 'https://api.a18n.help/v1/profile';
const LATEST_EMAIL_URL = `https://api.a18n.help/v1/profile/:profileId/email/latest`;

export declare interface A18nProfile {
  profileId: string;
  phoneNumber: string;
  emailAddress: string;
  url: string;
  displayName?: string;
  errorDescription?: string;
}

class A18nClient {
  apiKey: string | undefined;

  constructor() {
    const { a18nAPIKey } = getConfig();
    this.apiKey = a18nAPIKey ;
    if (!this.apiKey) {
      throw new Error('A18N_API_KEY env variable is not defined');
    }
  }

  async getEmailCode(profileId: string) {
    let retryAttemptsRemaining = 5;
    let response;
    while (!response?.content && retryAttemptsRemaining > 0) {
      await waitForOneSecond();
      response = await this.getOnURL(LATEST_EMAIL_URL.replace(':profileId', profileId)) as Record<string, string>;
      --retryAttemptsRemaining;
    }

    const match = response?.content?.match(/Enter a code instead: (?<code>\d+)/);
    if (!match) {
      throw new Error('Unable to retrieve code from email.');
    }
    return match?.groups?.code;
  }

  async createProfile(profileName?: string): Promise<A18nProfile|never> {
    const { orgName } = getConfig();
    const profile = await this.postToURL(PROFILE_URL, {
      displayName: profileName || orgName
    }, true) as unknown as A18nProfile;

    if (profile.errorDescription) {
      throw new Error(`a18n profile was not created: ${JSON.stringify(profile.errorDescription)}`);
    }

    return profile;
  }

  async deleteProfile(profileId: string): Promise<string> {
    return await this.deleteOnProtectedURL(`${PROFILE_URL}/${profileId}`);
  }

  private async deleteOnProtectedURL(url: string): Promise<string|never>{
    try {
      const response =  await fetch(url, {
        method: 'DELETE',
        headers: {
          'x-api-key': this.apiKey as string
        },
        
      });
      return await response.statusText;
    } catch (err) {
      console.log(`Error occured while requesting ${url}: ${err}`);
      throw err;
    }
  }

  private async postToURL(
    url: string, body?: Record<string, unknown>, includeApiToken=false): Promise<Record<string, unknown>|never>{
    try {
   
      const response =  await fetch(url, {
        method: 'POST',
        headers: includeApiToken ? {
          'x-api-key': this.apiKey as string
        } : {},
        body: JSON.stringify(body) || '',
      });
      return await response.json();
    } catch (err) {
      console.log(`Error occured while requesting ${url}: ${err}`);
      throw err;
    }
  }

  private async getOnURL(url: string, includeApiToken=false): Promise<Record<string, unknown>|never> {
    try {
      const response =  await fetch(url, {
        method: 'GET',
        headers: includeApiToken ? {
          'x-api-key': this.apiKey as string
        } : {},
      });
      return await response.json();
    } catch (err) {
      console.log(`Error occured while requesting ${url}: ${err}`);
      throw err;
    }
  }
}

export default new A18nClient();
