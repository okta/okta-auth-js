
import { exception } from 'console';
import fetch from 'cross-fetch';

const PROFILE_URL = 'https://api.a18n.help/v1/profile';
const LATEST_EMAIL_URL = `https://api.a18n.help/v1/profile/:profileId/email/latest`;



export declare interface A18nProfile {
  profileId: string;
  phoneNumber: string;
  emailAddress: string;
  url: string;
}

class A18nClient {
  apiKey: string;

  constructor() {
    this.apiKey = process.env.A18N_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('A18N_API_KEY env variable is not defined');
    }
  }

  async getEmailCode(profileId: string) {
    let response = await this._getOnURL(LATEST_EMAIL_URL.replace(':profileId', profileId)) as unknown as Record<string, string>;
    if (!response.content) {
      browser.waitUntil(() => new Promise(resolve => setTimeout(resolve.bind(this, true), 2000)));
      response = await this._getOnURL(LATEST_EMAIL_URL.replace(':profileId', profileId)) as unknown as Record<string, string>;
    }
    let match = response.content.match(/Enter a code instead: (?<code>\d+)/);
    if (match && match.groups) {
      return match.groups.code;
    }
    throw new Error('Unable to retrieve code from email.');
  }

  async createProfile(): Promise<A18nProfile> {
    const profile = await this._postToURL(PROFILE_URL, {}, true) as unknown as A18nProfile;
    return profile;
  }

  async deleteProfile(profileId: string): Promise<string> {
    const response = await this._deleteOnProtectedURL(`${PROFILE_URL}/${profileId}`) as unknown as Record<string, string>;
    return response.code;
  }

  async _deleteOnProtectedURL(url: string): Promise<string|never>{
    try {
      const response =  await fetch(url, {
        method: 'DELETE',
        headers: {
          'x-api-key': this.apiKey
        },
        
      });
      return await response.statusText;
    } catch (err) {
      console.log(`Error occured while requesting ${url}: ${err}`);
      throw err;
    }
  }

  async _postToURL(
    url: string, body?: Record<string, unknown>, includeApiToken=false): Promise<Record<string, unknown>|never>{
    try {
   
      const response =  await fetch(url, {
        method: 'POST',
        headers: includeApiToken ? {
          'x-api-key': this.apiKey
        } : {},
        body: JSON.stringify(body) || '',
      });
      return await response.json();
    } catch (err) {
      console.log(`Error occured while requesting ${url}: ${err}`);
      throw err;
    }
  }

  async _getOnURL(url: string, includeApiToken=false): Promise<Response|never> {
    try {
      const response =  await fetch(url, {
        method: 'GET',
        headers: includeApiToken ? {
          'x-api-key': this.apiKey
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