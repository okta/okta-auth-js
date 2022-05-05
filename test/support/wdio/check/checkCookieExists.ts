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
 * Check if a cookie with the given name exists
 * @param  {[type]}   name      The name of the cookie
 * @param  {[type]}   falseCase Whether or not to check if the cookie exists or
 *                              not
 */
export default (name: string, falseCase: boolean) => {
    /**
     * The cookie as retrieved from the browser
     * @type {Object}
     */
    const cookie = browser.getCookies(name);

    if (falseCase) {
        expect(cookie.length).toBe(
            0,
            // @ts-expect-error
            `Expected cookie "${name}" not to exists but it does`
        );
    } else {
        expect(cookie.length).not.toBe(
            0,
            // @ts-expect-error
            `Expected cookie "${name}" to exists but it does not`
        );
    }
};
