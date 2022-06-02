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

import { useState } from 'react';
import { Box, Button } from '@okta/odyssey-react';

import InputField from '../InputField';

const InputPassword = ({ uischema }) => {
  const [inputType, setInputType] = useState<'text' | 'password'>('password');
  const togglePassword = () => (inputType === 'password' ? setInputType('text') : setInputType('password'));

  return (
    // @ts-ignore OKTA-471233
    <Box>
      {/* @ts-ignore OKTA-471233 */}
      <Box marginBottom="m">
        <InputField
          uischema={uischema}
          type={inputType}
        />
      </Box>
      <Button
        data-testid="show-password"
        size="s"
        type="button"
        onClick={togglePassword}
      >
        {inputType === 'text' ? 'renderers.password.hidePassword' : 'renderers.password.showPassword'}
      </Button>
    </Box>
  );
};

export default InputPassword;
