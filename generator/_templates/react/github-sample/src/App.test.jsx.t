---
to: ../generated/<%= dest %>/src/App.test.jsx
---
<%- include(`${templates}/${generator}/license-banner.t`) %>

import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import App from './App';
<%- name === 'custom-login' ? `\njest.mock('./Login', () => () => <div>Login</div>);\n` : '' %>
let container;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

it('renders title link', async () => {
  await act(async () => {
    ReactDOM.render(<MemoryRouter><App /></MemoryRouter>, container);
  });

  const linkElement = container.querySelector('a');
  expect(linkElement.textContent.trim()).toBe('Okta-React Sample Project');
});
