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

import { useCallback, useEffect, useState } from 'react';

import { FormContext, useWidgetContext } from '../../contexts';
import { UISchemaElement, UISchemaLayout } from '../../types';
import { renderUISchemaLayout } from './renderUISchemaLayout';
import { toNestedObject } from './util';

type FormProps = {
  uischema: UISchemaLayout;
};

const Form = ({ uischema }) => {
  const [data, setData] = useState({});
  const { authClient, idxTransaction, setIdxTransaction } = useWidgetContext();

  // reset form data when a new transaction is available
  useEffect(() => {
    setData({});
  }, [idxTransaction, setData]);

  const handleSubmit = useCallback(async (e: any) => {
    e.preventDefault();

    // TODO: disable action buttons after click

    const immutableData = uischema.elements
      .filter((el) => (el as UISchemaElement).options.mutable === false)
      .reduce((acc, curr) => {
        const { name, value } = (curr as UISchemaElement).options;
        (acc as any)[name] = value;
        return acc;
      }, {});
    // const payload = merge(
    //   toNestedObject(immutableData),
    //   toNestedObject(data),
    // );
    const payload = toNestedObject(data);
    const transaction = await authClient.idx.proceed(payload);
    setIdxTransaction(transaction);
  }, [authClient, data, uischema, setIdxTransaction]);

  return (
    <FormContext.Provider value={{ data, setData }}>
      <form
        noValidate
        onSubmit={handleSubmit}
      >
        {renderUISchemaLayout(uischema)}
      </form>
    </FormContext.Provider>
  );
};

export default Form;
