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

import { createStorageOptionsConstructor } from '../storage';
import { HttpRequestClient, OktaAuthHttpOptions, RequestOptions } from './types';
import fetchRequest from '../fetch/fetchRequest';

export function createHttpOptionsConstructor() {
  const StorageOptionsConstructor = createStorageOptionsConstructor();
  return class HttpOptionsConstructor extends StorageOptionsConstructor implements Required<OktaAuthHttpOptions> {
    issuer: string;
    transformErrorXHR: (xhr: object) => any;
    headers: object;
    httpRequestClient: HttpRequestClient;
    httpRequestInterceptors: ((request: RequestOptions) => void)[];
    
    constructor(args: any) {
      super(args);
      this.issuer = args.issuer;
      this.transformErrorXHR = args.transformErrorXHR;
      this.headers = args.headers;
      this.httpRequestClient = args.httpRequestClient || fetchRequest;
      this.httpRequestInterceptors = args.httpRequestInterceptors;
    }
  };
}
