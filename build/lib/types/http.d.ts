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
import { StorageUtil } from './Storage';
export declare type RequestHeaders = Record<string, string>;
export declare type RequestData = Record<string, string> | string | object;
export interface RequestOptions {
    url?: string;
    method?: string;
    args?: RequestData;
    saveAuthnState?: boolean;
    accessToken?: string;
    withCredentials?: boolean;
    storageUtil?: StorageUtil;
    cacheResponse?: boolean;
    headers?: RequestHeaders;
}
export interface FetchOptions {
    headers?: HeadersInit;
    data?: RequestData;
    withCredentials?: boolean;
}
export interface FetchResponse {
    headers: {
        get(key: string): string;
    };
    json(): Promise<object>;
    text(): Promise<string>;
}
export declare type HttpRequestClient = (method: string, url: string, options: FetchOptions) => Promise<any>;
export interface HttpResponse {
    responseText: string;
    status: number;
    responseType?: string;
    responseJSON?: {
        [propName: string]: any;
    };
    headers: HeadersInit;
}
