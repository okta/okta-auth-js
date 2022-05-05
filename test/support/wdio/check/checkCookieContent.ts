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
 * Check the content of a cookie against a given value
 * @param  {String}   name          The name of the cookie
 * @param  {String}   falseCase     Whether or not to check if the value matches
 *                                  or not
 * @param  {String}   expectedValue The value to check against
 */
export default (
    name: string,
    falseCase: boolean,
    expectedValue: string
) => {
    /**
     * The cookie retrieved from the browser object
     * @type {Object}
     */
    const cookie = browser.getCookies(name)[0];
    expect(cookie.name).toBe(
        name,
        // @ts-expect-error
        `no cookie found with the name "${name}"`
    );

    if (falseCase) {
        expect(cookie.value).not.toBe(
            expectedValue,
            // @ts-expect-error
            `expected cookie "${name}" not to have value "${expectedValue}"`
        );
    } else {
        expect(cookie.value).toBe(
            expectedValue,
            // @ts-expect-error
            `expected cookie "${name}" to have value "${expectedValue}"`
            + ` but got "${cookie.value}"`
        );
    }
};
