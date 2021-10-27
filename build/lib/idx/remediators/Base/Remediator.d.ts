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
import { NextStep, IdxMessage, Authenticator } from '../../types';
import { IdxRemediation } from '../../types/idx-js';
export declare type IdxToRemediationValueMap = Record<string, string[]>;
export interface RemediationValues {
    stateHandle?: string;
    authenticators?: Authenticator[] | string[];
}
export declare class Remediator {
    static remediationName: string;
    remediation: IdxRemediation;
    values: RemediationValues;
    map?: IdxToRemediationValueMap;
    constructor(remediation: IdxRemediation, values?: RemediationValues);
    getName(): string;
    canRemediate(): boolean;
    getData(key?: string): any;
    hasData(key: string): boolean;
    getNextStep(): NextStep;
    private getInputs;
    getMessages(): IdxMessage[] | undefined;
    getValuesAfterProceed(): {
        authenticators: Authenticator[];
        stateHandle?: string;
    };
    protected getRelatesToType(): string;
}
