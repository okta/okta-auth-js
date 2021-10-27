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
export declare function bind(fn: any, ctx: any): () => any;
export declare function extend(): any;
export declare function removeNils(obj: any): {};
export declare function clone(obj: any): any;
export declare function omit(obj: any, ...props: any[]): any;
export declare function find(collection: any, searchParams: any): any;
export declare function getLink(obj: any, linkName: any, altName?: any): any;
