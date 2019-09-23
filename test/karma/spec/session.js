require('jasmine-ajax');

import OktaAuth from '@okta/okta-auth-js';
import OauthUtil from '../../../lib/oauthUtil';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

describe('session', () => {
  beforeEach(function() {
    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  fit('can poll on session.exists()', async (done) => {
    const BASE_URL = window.location.origin;
    const RESPONSE_TEXT = '{ "foo": "bar" }';
    const RESPONSE_OBJ = {
      status: 200,
      responseText: RESPONSE_TEXT,
    };
    const STATE = 'fake';
    // jasmine.Ajax.stubRequest(
    //   `${BASE_URL}/api/v1/sessions/me`
    // )
    // .andReturn(RESPONSE_OBJ);

    window.addEventListener('message', function(e) {
      console.log('Received message', e.data);
    });
    const auth = new OktaAuth({
      url: BASE_URL,
      clientId: 'fake'
    });

    spyOn(OauthUtil, 'loadFrame').and.callFake(() => {
      setTimeout(function() {
        console.log('posting message from iframe');
        window.postMessage({ state: STATE }, BASE_URL);
      });
    });
    await auth.token.getWithoutPrompt({ state: STATE });

    const p1 = auth.session.exists().then(() => {
      console.log('p1 resolved');
    });
    const r1 = jasmine.Ajax.requests.mostRecent();
    const p2 = auth.session.exists().then(() => {
      console.log('p2 resolved');
    });
    const r2 = jasmine.Ajax.requests.mostRecent();
      
    setTimeout(() => {
      console.log('responding 1');
      r1.respondWith(RESPONSE_OBJ);
    }, 500);

    setTimeout(() => {
      console.log('responding 2');
      r2.respondWith(RESPONSE_OBJ);
    }, 20);

    Promise.all([p1, p2]).then(() => {
      console.log('all resolved');
      done();
    });
  });
});
