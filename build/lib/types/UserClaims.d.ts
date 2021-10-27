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
/**
 *
 * This interface represents the union of possible known claims that are in an
 * ID Token or returned from the /userinfo response and depend on the
 * response_type and scope parameters in the authorize request
 */
export interface UserClaims {
    auth_time?: number;
    aud?: string;
    email?: string;
    email_verified?: boolean;
    exp?: number;
    family_name?: string;
    given_name?: string;
    iat?: number;
    iss?: string;
    jti?: string;
    locale?: string;
    name?: string;
    nonce?: string;
    preferred_username?: string;
    sub: string;
    updated_at?: number;
    ver?: number;
    zoneinfo?: string;
    [propName: string]: any;
}
