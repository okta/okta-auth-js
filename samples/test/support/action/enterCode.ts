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

export default async function (code: string) {
  const selectorCandidates = [
    `input[name=code]`,
    `input[name=verificationCode]`,
  ];
  let selector = '';
  await browser.waitUntil(async () => {
    for (const selectorCandidate of selectorCandidates) {
      const el = await $(selectorCandidate);
      const isDisplayed = await el?.isDisplayed();
      if (isDisplayed) {
        selector = selectorCandidate;
        return true;
      }
    }
    return false;
  }, {
    timeout: 3000,
    timeoutMsg: 'wait for correct selector'
  });
  await (await $(selector)).setValue(code);
}
