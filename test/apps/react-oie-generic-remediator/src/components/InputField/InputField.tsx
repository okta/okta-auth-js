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

import { TextInput } from '@okta/odyssey-react';

import { useOnChange, useValue } from '../../hooks';
import { UISchemaElement } from '../../types';

type InputFieldProps = {
  uischema: UISchemaElement;
  type?: string;
};

const InputField = ({ uischema, type }) => {
  const value = useValue(uischema);
  const onChangeHandler = useOnChange(uischema);

  const { name, label, visible } = uischema.options;

  if (visible === false) {
    return null;
  }

  return (
    <TextInput
      type={type || 'text'}
      name={name}
      value={value}
      id={name}
      data-testid={name}
      label={label}
      onChange={onChangeHandler}
    />
  );
};

export default InputField;
