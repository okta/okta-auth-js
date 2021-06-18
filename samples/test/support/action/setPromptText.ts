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


/* global assert */
/**
 * Set the text of the current prompt
 * @param  {String}   modalText The text to set to the prompt
 */
export default (modalText: string) => {
    try {
        browser.sendAlertText(modalText);
    } catch (e) {
        // @ts-expect-error is global
        assert(e, 'A prompt was not open when it should have been open');
    }
};
