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


/**
 * Check if the given URL was opened in a new window
 * @param  {String}   expectedUrl The URL to check for
 */
/* eslint-disable no-unused-vars */
export default (expectedUrl: string) => {
/* eslint-enable no-unused-vars */
    /**
     * All the current window handles
     * @type {Object}
     */
    const windowHandles = browser.getWindowHandles();

    expect(windowHandles.length).not.toBe(
        1,
        // @ts-expect-error
        'A popup was not opened'
    );

    /**
     * The last opened window handle
     * @type {Object}
     */
    const lastWindowHandle = windowHandles.slice(-1);

    // Make sure we focus on the last opened window handle
    browser.switchToWindow(lastWindowHandle[0]);

    /**
     * Get the URL of the current browser window
     * @type {String}
     */
    const windowUrl = browser.getUrl();

    expect(windowUrl).toContain(
        expectedUrl,
        // @ts-expect-error
        'The popup has a incorrect getUrl'
    );

    browser.closeWindow();
};
