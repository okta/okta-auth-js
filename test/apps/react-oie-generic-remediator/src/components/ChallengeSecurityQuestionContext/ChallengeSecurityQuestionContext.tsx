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

import { Box, Heading, Text } from '@okta/odyssey-react';

import { UISchemaElementComponent } from '../../types';

export const ChallengeSecurityQuestionContext: UISchemaElementComponent = ({
  uischema,
}) => {
  const {
    title,
    contextualData: {
      enrolledQuestion,
    } = {},
  } = uischema.options;

  return (
    // @ts-ignore OKTA-471233
    <Box
      display="flex"
      flexDirection="column"
    >
      { /* @ts-ignore OKTA-471233 */}
      <Box
        display="flex"
        justifyContent="flex-start"
        marginBottom="s"
      >
        <Heading
          level="2"
          visualLevel="3"
        >
          {title}
        </Heading>
      </Box>

      <Text as="strong">{enrolledQuestion?.question}</Text>
    </Box>
  );
};
