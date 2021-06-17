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
 * Check the text of a modal
 * @param  {String}   modalType     The type of modal that is expected
 *                                  (alertbox, confirmbox or prompt)
 * @param  {String}   falseState    Whether to check if the text matches or not
 * @param  {String}   expectedText  The text to check against
 */
export default (
    modalType: 'alertbox' | 'confirmbox' | 'prompt',
    falseState: string,
    expectedText: string
) => {
    try {
        /**
         * The text of the current modal
         * @type {String}
         */
        const text = browser.getAlertText();

        if (falseState) {
            expect(text).not.toEqual(
                expectedText,
                // @ts-expect-error
                `Expected the text of ${modalType} not to equal `
                + `"${expectedText}"`
            );
        } else {
            expect(text).toEqual(
                expectedText,
                // @ts-expect-error
                `Expected the text of ${modalType} to equal `
                + `"${expectedText}", instead found "${text}"`
            );
        }
    } catch (e) {
        throw new Error(`A ${modalType} was not opened when it should have been opened`);
    }
};
