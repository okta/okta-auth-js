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

import {
  CustomLayout,
  isUISchemaLayoutType,
  PickerSchema,
  UISchemaElement,
  UISchemaLayout,
} from '../../types';

export const mapLayout = (
  layout: CustomLayout,
  elements: UISchemaElement[],
): UISchemaLayout => {
  const res: UISchemaLayout = {
    type: layout.type,
    elements: [],
  };

  return layout.elements
    .reduce((acc: UISchemaLayout, layoutElement) => {
      const {
        tester,
        mapper = (schema) => schema,
      } = layoutElement as PickerSchema;
      if (typeof tester === 'function') {
        const schemas = elements.filter(tester);

        if (!schemas.length) {
          throw new Error('Cannot find UI element');
        }

        schemas.forEach((s) => {
          acc.elements.push(mapper!(s));
        });

        return acc;
      }

      // dfs layout element
      if (isUISchemaLayoutType((layoutElement as CustomLayout).type)) {
        acc.elements.push(
          mapLayout((layoutElement as CustomLayout), elements),
        );
        return acc;
      }

      // pick element directly if it's not a layout element
      acc.elements.push(layoutElement as UISchemaElement);
      return acc;
    }, res) as UISchemaLayout;
};
