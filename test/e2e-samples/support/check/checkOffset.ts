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
 * Check the offset of the given element
 * @param  {String}   selector              Element selector
 * @param  {String}   falseCase         Whether to check if the offset matches
 *                                      or not
 * @param  {String}   expectedPosition  The position to check against
 * @param  {String}   axis              The axis to check on (x or y)
 */
export default (
    selector: Selector,
    falseCase: boolean,
    expectedPosition: string,
    axis: 'x' | 'y'
) => {
    /**
     * Get the location of the element on the given axis
     * @type {[type]}
     */
    const location = $(selector).getLocation(axis);

    /**
     * Parsed expected position
     * @type {Int}
     */
    const intExpectedPosition = parseFloat(expectedPosition);

    if (falseCase) {
        expect(location).not.toEqual(
            intExpectedPosition,
            // @ts-expect-error
            `Element "${selector}" should not be positioned at `
            + `${intExpectedPosition}px on the ${axis} axis`
        );
    } else {
        expect(location).toEqual(
            intExpectedPosition,
            // @ts-expect-error
            `Element "${selector}" should be positioned at `
            + `${intExpectedPosition}px on the ${axis} axis, but was found `
            + `at ${location}px`
        );
    }
};
