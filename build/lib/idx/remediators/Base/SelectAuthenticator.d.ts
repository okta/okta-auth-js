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
import { Remediator, RemediationValues } from './Remediator';
import { IdxRemediation, IdxRemediationValue } from '../../types/idx-js';
export declare type SelectAuthenticatorValues = RemediationValues & {
    authenticator?: string;
};
export declare class SelectAuthenticator extends Remediator {
    values: SelectAuthenticatorValues;
    matchedOption: IdxRemediation;
    map: {
        authenticator: any[];
    };
    constructor(remediation: IdxRemediation, values?: SelectAuthenticatorValues);
    canRemediate(): boolean;
    getNextStep(): {
        options: {
            label: string;
            value: string;
        }[];
        name: string;
        type?: string;
        canSkip?: boolean;
        canResend?: boolean;
        inputs?: {
            name: string;
            required?: boolean;
        }[];
    };
    mapAuthenticator(remediationValue: IdxRemediationValue): {
        id: any;
    };
    getInputAuthenticator(): {
        name: string;
        type: string;
    };
}
