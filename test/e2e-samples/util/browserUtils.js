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



async function waitForPopup(openPopupPromise) {
  // Get existing windows count
  const existingHandlesCount = (await browser.getWindowHandles()).length;

  // Open popup window
  await openPopupPromise();

  // Wait for popup window opened and switch to it
  let handles;
  await browser.waitUntil(async () => {
    handles = await browser.getWindowHandles();
    return handles.length > existingHandlesCount;
  });
  await browser.switchToWindow(handles[handles.length - 1]);

  // Close popup
  try {
    await browser.closeWindow();
  } catch(_e) {
    // Can be already closed
  }

  // Return to original window
  await browser.switchToWindow(handles[existingHandlesCount - 1]);
}

async function getCurrentUrl(removeHash = false) {
    /**
     * The URL of the current browser window
     * @type {String}
     */
    let currentUrl = await browser.getUrl();
    currentUrl = currentUrl.replace(/http(s?):\/\//, '');
    if (removeHash) {
        currentUrl = currentUrl.replace(/#(.*?)$/, '');
    }

    /**
     * The base URL of the current browser window
     * @type {Object}
     */
    const domain = `${currentUrl.split('/')[0]}`;

    currentUrl = currentUrl.replace(domain, '');

    return currentUrl;
}

export {
  waitForPopup,
  getCurrentUrl
};
