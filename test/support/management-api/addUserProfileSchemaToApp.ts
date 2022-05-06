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

import getOktaClient, { OktaClientConfig } from './util/getOktaClient';

type Options = {
  appId: string; 
  schemaName: string;
}

const MAP = {
  age: {
    'definitions': {
      'custom': {
        'id': '#custom',
        'type': 'object',
        'properties': {
          'age': {
            'title': 'Age',
            'description': 'age',
            'type': 'number',
            'required': false,
            'minimum': 0,
            'maximum': 200
          }
        },
        'required': []
      }
    }
  }
};

export const addUserProfileSchemaToApp = async (config: OktaClientConfig, options: Options) => {
  const oktaClient = getOktaClient(config);
  const { appId, schemaName } = options;
  const res = await oktaClient.updateApplicationUserProfile(appId, (MAP as any)[schemaName]);
  return res;
}
