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
 * Check the selected state of the given element
 * @param  {String}   selector   Element selector
 * @param  {String}   falseCase Whether to check if the element is elected or
 *                              not
 */
export default (selector: Selector, falseCase: boolean) => {
    /**
     * The selected state
     * @type {Boolean}
     */
    const isSelected = $(selector).isSelected();

    if (falseCase) {
        expect(isSelected)
            // @ts-expect-error
            .not.toEqual(true, `"${selector}" should not be selected`);
    } else {
        expect(isSelected)
            // @ts-expect-error
            .toEqual(true, `"${selector}" should be selected`);
    }
};
