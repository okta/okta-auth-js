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
 * Check if the given element is (not) visible
 * @param  {String}   selector   Element selector
 * @param  {String}   falseCase Check for a visible or a hidden element
 */
export default async (selector: Selector, falseCase: boolean) => {
    /**
     * Visible state of the give element
     * @type {String}
     */
 
    const isDisplayed = await (await $(selector)).isDisplayed();
    
    if (falseCase) {
        expect(isDisplayed).not.toEqual(
            true,
            // @ts-expect-error
            `Expected element "${selector}" not to be displayed`
        );
    } else {
        expect(isDisplayed).toEqual(
            true,
            // @ts-expect-error
            `Expected element "${selector}" to be displayed`
        );
    }
};
