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


/* global window */

import { loadPopup } from '../../../../lib/oidc/util';
import * as libFeatures from '../../../../lib/features';

describe('loadPopup', function() {
  it('popups window with full src url directly when none-IE', function () {
    var mockElem = {} as unknown as Window;
    jest.spyOn(libFeatures, 'isIE11OrLess').mockReturnValue(false);
    jest.spyOn(window, 'open').mockReturnValue(mockElem);

    var winEl = loadPopup('/path/to/foo', {
      popupTitle: 'Hello Okta'
    });

    expect(winEl).toBe(mockElem);
    expect((window.open as jest.Mock).mock.calls.length).toBe(1);
    expect(window.open).toHaveBeenCalledWith(
      '/path/to/foo',
      'Hello Okta',
      'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
    );
  });

  it('popups window with full src url directly and default title', function () {
    var mockElem = {} as unknown as Window;
    jest.spyOn(libFeatures, 'isIE11OrLess').mockReturnValue(false);
    jest.spyOn(window, 'open').mockReturnValue(mockElem);

    var winEl = loadPopup('/path/to/foo', {});

    expect(winEl).toBe(mockElem);
    expect((window.open as jest.Mock).mock.calls.length).toBe(1);
    expect(window.open).toHaveBeenCalledWith(
      '/path/to/foo',
      'External Identity Provider User Authentication',
      'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
    );
  });

});