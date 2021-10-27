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
import { FlowMonitor } from './flowMonitors';
import * as remediators from './remediators';
import { OktaAuth, IdxOptions, IdxTransaction } from '../types';
export declare type RemediationFlow = Record<string, typeof remediators.Remediator>;
export interface RunOptions {
    flow?: RemediationFlow;
    actions?: string[];
    flowMonitor?: FlowMonitor;
}
export declare function run(authClient: OktaAuth, options: RunOptions & IdxOptions): Promise<IdxTransaction>;
