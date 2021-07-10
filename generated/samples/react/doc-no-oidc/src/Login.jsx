/*
 * Copyright (c) 2018-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React, { useEffect, useRef } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import * as OktaSignIn from '@okta/okta-signin-widget';
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css';

import config from './config';

const Login = ({ setCorsErrorModalOpen }) => {
  const { oktaAuth } = useOktaAuth();
  const widgetRef = useRef();

  useEffect(() => {
    if (!widgetRef.current) {
      return false;
    }

    const { issuer, clientId, redirectUri, scopes, useInteractionCode } = config.oidc;
    const widget = new OktaSignIn({
      /**
       * Note: when using the Sign-In Widget for an OIDC flow, it still
       * needs to be configured with the base URL for your Okta Org. Here
       * we derive it from the given issuer for convenience.
       */
      baseUrl: issuer.split('/oauth2')[0],
      clientId,
      redirectUri,
      logo: '/react.svg',
      i18n: {
        en: {
          'primaryauth.title': 'Sign in to React & Company',
        },
      },
      authParams: {
        // To avoid redirect do not set "pkce" or "display" here. OKTA-335945
        issuer,
        scopes,
      },
      useInteractionCodeFlow: useInteractionCode, // Set to true, if your org is OIE enabled
    });

    widget.renderEl(
      { el: widgetRef.current },
      (res) => {
        console.log(res);
        oktaAuth.handleLoginRedirect(res.tokens);
      },
      (err) => {
        throw err;
      },
    );

    // Note: Can't distinguish CORS error from other network errors
    const isCorsError = (err) => (err.name === 'AuthApiError' && !err.statusCode);

    widget.on('afterError', (_context, error) => {
      if (isCorsError(error)) {
        setCorsErrorModalOpen(true);
      }
    });

    return () => widget.remove();
  }, [oktaAuth]);

  return (
    <div>
      <div ref={widgetRef} />
    </div>
  );
};

export default Login;
