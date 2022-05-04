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


import { User, Application, Policy, Group } from '@okta/okta-sdk-nodejs';
import A18nClient, { A18nConfig } from './management-api/a18nClient';
import { UserCredentials } from './management-api/createCredentials';
import { OktaClientConfig } from './management-api/util/getOktaClient';

interface ActionContext {
  credentials: UserCredentials;
  secondCredentials: UserCredentials;
  user: User;
  app: Application;
  policies: Policy[];
  group: Group;
  enrolledFactor: any;
  featureName: string;
  scenarioName: string;
  userName?: string;
  sharedSecret?: string;
  customAttribute: string;
  config: OktaClientConfig & A18nConfig;
  a18nClient: A18nClient;
}

export default ActionContext;
