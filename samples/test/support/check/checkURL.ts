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
 * Check the URL of the given browser window
 * @param  {String}   falseCase   Whether to check if the URL matches the
 *                                expected value or not
 * @param  {String}   expectedUrl The expected URL to check against
 */
export default async (falseCase: boolean, expectedUrl: string) => {
    /**
     * The current browser window's URL
     * @type {String}
     */
    const currentUrl = await browser.getUrl();

    if (falseCase) {
        expect(currentUrl)
            // @ts-expect-error
            .not.toEqual(expectedUrl, `expected url not to be "${currentUrl}"`);
    } else {
        expect(currentUrl).toEqual(
            expectedUrl,
            // @ts-expect-error
            `expected url to be "${expectedUrl}" but found `
            + `"${currentUrl}"`
        );
    }
};
