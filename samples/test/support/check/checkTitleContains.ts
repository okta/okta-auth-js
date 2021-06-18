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
 * Check the title of the current browser window contains expected text/title
 * @param  {Type}     falseCase     Whether to check if the title contains the
 *                                  expected value or not
 * @param  {Type}     expectedTitle The expected title
 */
export default (falseCase: boolean, expectedTitle: string) => {
    /**
     * The actual title of the current browser window
     * @type {String}
     */
    const title = browser.getTitle();

    if (falseCase) {
        expect(title).not.toContain(
            expectedTitle,
            // @ts-expect-error
            `Expected title not to contain "${expectedTitle}"`
        );
    } else {
        expect(title).toContain(
            expectedTitle,
            // @ts-expect-error
            `Expected title to contain "${expectedTitle}" but found "${title}"`
        );
    }
};
