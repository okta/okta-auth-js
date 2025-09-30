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


/* global $ */
import { Selector } from 'webdriverio';

/**
 * Select an option of a select element
 * @param  {String}   selectionType  Type of method to select by (name, value or
 *                                   text)
 * @param  {String}   selectionValue Value to select by
 * @param  {String}   selector     Element selector
 */
export default async (
    selectionType: 'name' | 'value' | 'text',
    selectionValue: string,
    selector: Selector
) => {
    /**
     * The method to use for selecting the option
     * @type {String}
     */
    let command: 'selectByAttribute' | 'selectByAttribute' | 'selectByVisibleText';
    const commandArguments: string[] = [selectionValue];

    switch (selectionType) {
        case 'name': {
            command = 'selectByAttribute';

            // The selectByAttribute command expects the attribute name as it
            // second argument so let's add it
            commandArguments.unshift('name');

            break;
        }

        case 'value': {
            // The selectByAttribute command expects the attribute name as it
            // second argument so let's add it
            commandArguments.unshift('value');
            command = 'selectByAttribute';
            break;
        }

        case 'text': {
            command = 'selectByVisibleText';
            break;
        }

        default: {
            throw new Error(`Unknown selection type "${selectionType}"`);
        }
    }

    // @ts-expect-error - spreading arguments for function call
    (await $(selector))[command](...commandArguments);
};
