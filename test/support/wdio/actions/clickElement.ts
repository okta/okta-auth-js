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


import { Selector } from 'webdriverio';

import checkIfElementExists from '../lib/checkIfElementExists';

/**
 * Perform an click action on the given element
 * @param  {String}   action  The action to perform (click or doubleClick)
 * @param  {String}   type    Type of the element (link or selector)
 * @param  {String}   selector Element selector
 */
export const clickElement = async (
    action: 'click' | 'doubleClick',
    type: 'link' | 'selector',
    selector: Selector
) => {
    /**
     * Element to perform the action on
     * @type {String}
     */
    const selector2 = (type === 'link') ? `[href="${selector}"]` : selector;

    /**
     * The method to call on the browser object
     * @type {String}
     */
    const method = (action === 'click') ? 'click' : 'doubleClick';

    await checkIfElementExists(selector2);

    const el = await $(selector2);

    await browser.execute(`arguments[0].${method}();`, el);
};
