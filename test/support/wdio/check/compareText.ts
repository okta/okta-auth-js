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


import type { Selector } from 'webdriverio';

/**
 * Compare the contents of two elements with each other
 * @param  {String}   selector1  Element selector for the first element
 * @param  {String}   falseCase Whether to check if the contents of both
 *                              elements match or not
 * @param  {String}   selector2  Element selector for the second element
 */
export default (
    selector1: Selector,
    falseCase: boolean,
    selector2: Selector
) => {
    /**
     * The text of the first element
     * @type {String}
     */
    const text1 = $(selector1).getText();

    /**
     * The text of the second element
     * @type {String}
     */
    const text2 = $(selector2).getText();

    if (falseCase) {
        expect(text1).not.toEqual(
            text2,
            // @ts-expect-error
            `Expected text not to be "${text1}"`
        );
    } else {
        expect(text1).toEqual(
            text2,
            // @ts-expect-error
            `Expected text to be "${text1}" but found "${text2}"`
        );
    }
};
