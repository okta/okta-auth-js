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


/* global $$ */
import { Selector } from 'webdriverio';
import waitForDisplayed from '../wait/waitForDisplayed';

/**
 * Check if the given element exists in the DOM one or more times
 * @param  {String}  selector  Element selector
 * @param  {Boolean} falseCase Check if the element (does not) exists
 * @param  {Number}  exactly   Check if the element exists exactly this number
 *                             of times
 */
export default async (
    selector: Selector,
    falseCase?: boolean,
    exactly?: string | number
) => {
    /**
     * The number of elements found in the DOM
     * @type {Int}
     */
    if (falseCase !== true) {
        await waitForDisplayed(selector);
    }
    
    const nrOfElements = await $$(selector);

    if (falseCase === true) {
        expect(nrOfElements.length).toBe(
            0,
            // @ts-expect-error
            `Element with selector "${selector}" should not exist on the page`
        );
    } else if (exactly) {
        expect(nrOfElements.length).toBe(
            exactly,
            // @ts-expect-error
            `Element with selector "${selector}" should exist exactly ${exactly} time(s)`
        );
    } else {
        expect(nrOfElements.length).toBeGreaterThanOrEqual(
            1,
            // @ts-expect-error
            `Element with selector "${selector}" should exist on the page`
        );
    }
};
