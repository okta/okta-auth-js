/* global window */

import { loadPopup } from '../../../../lib/oidc/util';
import * as libUtil from '../../../../lib/util';

describe('loadPopup', function() {
  it('popups window with full src url directly when none-IE', function () {
    var mockElem = {} as unknown as Window;
    jest.spyOn(libUtil, 'isIE11OrLess').mockReturnValue(false);
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
    jest.spyOn(libUtil, 'isIE11OrLess').mockReturnValue(false);
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

  it('popups window with full src url directly when IE mode', function () {
    var mockElem = {
      location: {

      }
    } as unknown as Window;
    jest.spyOn(libUtil, 'isIE11OrLess').mockReturnValue(true);
    jest.spyOn(window, 'open').mockReturnValue(mockElem);

    var winEl = loadPopup('/path/to/foo', {
      popupTitle: 'Hello Okta'
    });

    expect(winEl).toBe(mockElem);
    expect((window.open as jest.Mock).mock.calls.length).toBe(1);
    expect(window.open).toHaveBeenCalledWith(
      '/',
      'Hello Okta',
      'toolbar=no, scrollbars=yes, resizable=yes, top=100, left=500, width=600, height=600'
    );
    expect(winEl.location.href).toBe('/path/to/foo');
  });

});