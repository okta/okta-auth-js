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
 * Check if a modal was opened
 * @param  {String}   modalType  The type of modal that is expected (alertbox,
 *                               confirmbox or prompt)
 * @param  {String}   falseState Whether to check if the modal was opened or not
 */
export default (
    modalType: 'alertbox' | 'confirmbox' | 'prompt',
    falseState: string
) => {
    /**
     * The text of the prompt
     * @type {String}
     */
    let promptText = '';

    try {
        promptText = browser.getAlertText();

        if (falseState) {
            expect(promptText).not.toEqual(
                null,
                // @ts-expect-error
                `A ${modalType} was opened when it shouldn't`
            );
        }
    } catch (e) {
        if (!falseState) {
            expect(promptText).toEqual(
                null,
                // @ts-expect-error
                `A ${modalType} was not opened when it should have been`
            );
        }
    }
};
