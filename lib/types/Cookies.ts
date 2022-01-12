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

// From @types/js-cookie@3.0.1
// https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/js-cookie
// TODO: remove and import from "js-cookie" once it's upgrade to v3
interface CookieAttributes {
  /**
   * Define when the cookie will be removed. Value can be a Number
   * which will be interpreted as days from time of creation or a
   * Date instance. If omitted, the cookie becomes a session cookie.
   */
  expires?: number | Date | undefined;

  /**
   * Define the path where the cookie is available. Defaults to '/'
   */
  path?: string | undefined;

  /**
   * Define the domain where the cookie is available. Defaults to
   * the domain of the page where the cookie was created.
   */
  domain?: string | undefined;

  /**
   * A Boolean indicating if the cookie transmission requires a
   * secure protocol (https). Defaults to false.
   */
  secure?: boolean | undefined;

  /**
   * Asserts that a cookie must not be sent with cross-origin requests,
   * providing some protection against cross-site request forgery
   * attacks (CSRF)
   */
  sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None' | undefined;

  /**
   * An attribute which will be serialized, conformably to RFC 6265
   * section 5.2.
   */
  [property: string]: any;
}

export interface CookieOptions extends CookieAttributes{
  sessionCookie?: boolean;
}

export interface Cookies {
  set(name: string, value: string, expiresAt: string, options: CookieOptions): string;
  get(name: string): string;
  delete(name: string): string;
}
