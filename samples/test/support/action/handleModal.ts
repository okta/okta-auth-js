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
 * Handle a modal
 * @param  {String}   action    Action to perform on the modal (accept, dismiss)
 * @param  {String}   modalType Type of modal (alertbox, confirmbox, prompt)
 */
export default (
    action: 'accept' | 'dismiss',
    modalType: 'alertbox' | 'confirmbox' | 'prompt'
) => {
    /**
     * The command to perform on the browser object
     * @type {String}
     */
    let command = `${action.slice(0, 1).toLowerCase()}${action.slice(1)}Alert` as
        'acceptAlert' | 'dismissAlert';

    /**
     * Alert boxes can't be dismissed, this causes Chrome to crash during tests
     */
    if (modalType === 'alertbox') {
        command = 'acceptAlert';
    }

    browser[command]();
};
