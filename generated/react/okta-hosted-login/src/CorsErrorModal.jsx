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
