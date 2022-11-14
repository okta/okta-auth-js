/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */


const fetch = require('cross-fetch');

const PROFILE_URL = 'https://api.a18n.help/v1/profile';
const LATEST_EMAIL_URL = `https://api.a18n.help/v1/profile/:profileId/email/latest`;
const LATEST_SMS_URL = `https://api.a18n.help/v1/profile/:profileId/sms/latest`;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class A18nClient {
  constructor(config) {
    const { a18nAPIKey } = config;
    this.apiKey = a18nAPIKey;
    if (!this.apiKey) {
      throw new Error('A18N_API_KEY env variable is not defined');
    }
  }

  async getEmailCode(profileId) {
    let retryAttemptsRemaining = 5;
    let response;
    while (!response?.content && retryAttemptsRemaining > 0) {
      await sleep(1000);  // wait 1 second
      response = await this.getOnURL(LATEST_EMAIL_URL.replace(':profileId', profileId));
      --retryAttemptsRemaining;
    }

    const match = response?.content?.match(/Enter a code instead: (?<code>\d+)/) 
      || response?.content?.match(/enter this code: <b>(?<code>\d+)<\/b>/)
      || response?.content?.match(/please contact your system administrator immediately.[\s\S]\s*(?<code>\d+)/);
    const code = match?.groups?.code;
    if (!code) {
      throw new Error('Unable to retrieve code from email.');
    }
    return code;
  }

  async getEmailMagicLink(profileId) {
    let retryAttemptsRemaining = 5;
    let response;
    while (!response?.content && retryAttemptsRemaining > 0) {
      await sleep(1000);  // wait 1 second
      response = await this.getOnURL(LATEST_EMAIL_URL.replace(':profileId', profileId));
      --retryAttemptsRemaining;
    }

    const match = response?.content?.match(/<a id="email-authentication-button" href="(?<url>\S+)"/);
    const url = match?.groups?.url;
    if (!url) {
      throw new Error('Unable to retrieve magic link from email.');
    }

    return url;
  }

  async getEmailMagicLinkForUnlock(profileId) {
    let retryAttemptsRemaining = 5;
    let response;
    while (!response?.content && retryAttemptsRemaining > 0) {
      await sleep(1000);  // wait 1 second
      response = await this.getOnURL(LATEST_EMAIL_URL.replace(':profileId', profileId));
      --retryAttemptsRemaining;
    }

    const match = response?.content?.match(/<a id="unlock-account-link" href="(?<url>\S+)"/);
    const url = match?.groups?.url;
    if (!url) {
      throw new Error('Unable to retrieve magic link from email.');
    }

    return url;
  }

  async getEmailMagicLinkForEmailVerification(profileId) {
    let retryAttemptsRemaining = 5;
    let response;
    while (!response?.content && retryAttemptsRemaining > 0) {
      await sleep(1000);  // wait 1 second
      response = await this.getOnURL(LATEST_EMAIL_URL.replace(':profileId', profileId));
      --retryAttemptsRemaining;
    }

    const match = response?.content?.match(/<a id="email-activation-button" href="(?<url>\S+)"/);
    const url = match?.groups?.url;
    if (!url) {
      throw new Error('Unable to retrieve magic link from email.');
    }

    return url;
  }

  async getSMSCode(profileId) {
    let retryAttemptsRemaining = 30; // sms take some time to arrive, set maximum try to 30
    let response;
    while (!response?.content && retryAttemptsRemaining-- > 0) {
      await sleep(1000);  // wait 1 second
      response = await this.getOnURL(LATEST_SMS_URL.replace(':profileId', profileId));
    }

    const match = response?.content?.match(/Your verification code is (?<code>\d+)/);
    const code = match?.groups?.code;
    return code;
  }

  async getOktaVerifyEnrollLinkFromSMS(profileId) {
    let retryAttemptsRemaining = 30; // sms take some time to arrive, set maximum try to 30
    let response;
    while (!response?.content && retryAttemptsRemaining-- > 0) {
      await sleep(1000);  // wait 1 second
      response = await this.getOnURL(LATEST_SMS_URL.replace(':profileId', profileId));
    }

    const match = response?.content?.match(/Click here to enroll Okta Verify : (?<url>\S+)/);
    const url = match?.groups?.url;
    if (!url) {
      throw new Error('Unable to retrieve Okta Verify Enroll link');
    }

    return url;
  }

  async getOktaVerifyEnrollLinkFromEmail(profileId) {
    let retryAttemptsRemaining = 5;
    let response;
    while (!response?.content && retryAttemptsRemaining > 0) {
      await sleep(1000);  // wait 1 second
      response = await this.getOnURL(LATEST_EMAIL_URL.replace(':profileId', profileId));
      --retryAttemptsRemaining;
    }

    const match = response?.content?.match(/<a id="push-verify-activation-link" href="(?<url>\S+)"/);
    const url = match?.groups?.url;
    if (!url) {
      throw new Error('Unable to retrieve Okta Verify Enroll link');
    }

    return url;
  }

  async createProfile(profileName) {
    const profile = await this.postToURL(PROFILE_URL, {
      displayName: profileName || 'javascript-idx-sdk'
    }, true);

    if (profile.errorDescription) {
      throw new Error(`a18n profile was not created: ${JSON.stringify(profile.errorDescription)}`);
    }

    return profile;
  }

  async deleteProfile(profileId) {
    return await this.deleteOnProtectedURL(`${PROFILE_URL}/${profileId}`);
  }

  async deleteOnProtectedURL(url) {
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

  async postToURL(url, body, includeApiToken=false) {
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

  async getOnURL(url, includeApiToken=false) {
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

module.exports = A18nClient;
