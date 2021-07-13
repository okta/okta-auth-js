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
 * Check if the given string is in the URL path
 * @param  {String}   falseCase       Whether to check if the given string is in
 *                                    the URL path or not
 * @param  {String}   expectedUrlPart The string to check for
 */
export default (falseCase: boolean, expectedUrlPart: string) => {
    /**
     * The URL of the current browser window
     * @type {String}
     */
    const currentUrl = browser.getUrl();

    if (falseCase) {
        expect(currentUrl).not.toContain(
            expectedUrlPart,
            // @ts-expect-error
            `Expected URL "${currentUrl}" not to contain `
            + `"${expectedUrlPart}"`
        );
    } else {
        expect(currentUrl).toContain(
            expectedUrlPart,
            // @ts-expect-error
            `Expected URL "${currentUrl}" to contain "${expectedUrlPart}"`
        );
    }
};
