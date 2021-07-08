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

import React from 'react';
import { Modal } from 'semantic-ui-react';
import config from './config';

const CorsErrorModal = ({ corsErrorModalOpen, setCorsErrorModalOpen }) => {
  // Build URL to "Trusted Origins" page in Admin panel
  const { issuer } = config.oidc;
  const baseUrl = issuer.split('/oauth2')[0];
  const hostParts = new URL(baseUrl).host.split('.');
  hostParts[0] += '-admin';
  const adminHost = hostParts.join('.');
  const corsAdminUrl = `https://${adminHost}/admin/access/api/trusted_origins`;

  // URL to guide for enabling CORS
  const guideUrl = 'https://developer.okta.com/docs/guides/enable-cors/granting-cors/';

  // CORS error modal
  return (
    <Modal
      onClose={() => setCorsErrorModalOpen(false)}
      open={corsErrorModalOpen}
      closeIcon
    >
      <Modal.Header>Network Error</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <p>Seems like logout API call resulted with CORS error.</p>
          <p>
            You may need to add your origin
            {' '}
            {window.location.origin}
            {' '}
            to list of trusted origins in your
            {' '}
            <a href={corsAdminUrl} target="_blank" rel="noreferrer">Okta Administrator Dashboard</a>
          </p>
          <p>
            Read
            {' '}
            <a href={guideUrl} target="_blank" rel="noreferrer">this guide</a>
            {' '}
            for more info.
          </p>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};
export default CorsErrorModal;
