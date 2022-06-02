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

import { IdxAuthenticator, Input } from '@okta/okta-auth-js';

type TitleOptions = {
  title: string;
};

export interface UISchemaElement {
  type: string;
  label?: string;
  options: Input & IdxAuthenticator & TitleOptions;
}

export interface UISchemaLayout {
  type: UISchemaLayoutType;
  elements: (UISchemaElement | UISchemaLayout)[];
}

export type PickerSchema = {
  tester: (schema: UISchemaElement) => boolean;
  mapper?: (schema: UISchemaElement) => UISchemaElement;
};
export interface CustomLayout {
  type: UISchemaLayoutType;
  elements: (CustomLayout | UISchemaElement | PickerSchema)[];
}

export enum UISchemaLayoutType {
  HORIZONTAL = 'HorizontalLayout',
  VERTICAL = 'VerticalLayout',
}

export function isUISchemaLayoutType(type: string) {
  return Object.values(UISchemaLayoutType).includes(type as UISchemaLayoutType);
}
