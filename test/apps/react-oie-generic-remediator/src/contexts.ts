/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { useContext, createContext } from 'react';
import { OktaAuth } from '@okta/okta-auth-js';

const noop = () => {};

// interface IWidgetContext {
//   authClient: OktaAuth,
//   idxTransaction: IdxTransaction | undefined;
//   setIdxTransaction: StateUpdater<IdxTransaction | undefined>;
//   // TODO: update when it's implemented
//   // theme: string;
// }

export const WidgetContext = createContext({
  authClient: {} as OktaAuth,
  idxTransaction: undefined,
  setIdxTransaction: noop,
  // theme: '',
});
export const useWidgetContext = () => useContext(WidgetContext);

// interface IFormContext {
//   data: JsonObject;
//   setData: StateUpdater<Record<string, unknown>>;
//   // setMessages: StateUpdater<IdxMessage[]>;
// }

export const FormContext = createContext({
  data: {},
  setData: noop,
  // setMessages: noop,
});

export const useFormContext = () => useContext(FormContext);
