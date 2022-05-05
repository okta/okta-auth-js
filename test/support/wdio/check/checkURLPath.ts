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


import { getCurrentUrl } from '../../util';

/**
 * Check if the current URL path matches the given path
 * @param  {Boolean}  falseCase    Whether to check if the path matches the
 *                                 expected value or not
 * @param  {String}   expectedPath The expected path to match against
 * @param  {Boolean}  removeHash Whether to strip hash before check
 */
export default async (falseCase: boolean, expectedPath: string, removeHash = false) => {
    const currentUrl = await getCurrentUrl(removeHash);

    if (falseCase) {
        expect(currentUrl)
            // @ts-expect-error
            .not.toEqual(expectedPath, `expected path not to be "${currentUrl}"`);
    } else {
        expect(currentUrl).toEqual(
            expectedPath,
            // @ts-expect-error
            `expected path to be "${expectedPath}" but found `
            + `"${currentUrl}"`
        );
    }
};
