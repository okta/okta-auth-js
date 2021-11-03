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

const post = jest.fn().mockResolvedValue(null);
jest.mock('../../../lib/http', () => { 
  return { post };
});

import { postToTransaction } from '../../../lib/tx';

describe('tx - api', () => {
  let auth;
  beforeEach(() => {
    auth = {};
  });

  describe('postToTransaction', () => {
    it('sets default withCrednetials options as true', async () => {
      const url = 'http://fake.domain.com/api';
      const args = { fake1: 'fake1' };
      const options = { fake2: 'fake2' };
      await postToTransaction(auth, url, args, options);
      expect(post).toHaveBeenCalledWith(auth, url, args, {
        fake2: 'fake2',
        withCredentials: true
      });
    });
  });
});
