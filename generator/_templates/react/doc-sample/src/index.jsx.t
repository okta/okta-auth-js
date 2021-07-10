---
to: ../generated/<%= dest %>/src/index.jsx
---
<%- include(`${templates}/${generator}/license-banner.t`) %>

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root'),
);
