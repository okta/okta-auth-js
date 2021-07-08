---
to: ../generated/<%= dest %>/<%= name %>/src/polyfills.js
---
<%- include(`${templates}/${generator}/license-banner.t`) %>

// polyfill TextEncoder for IE Edge
import { TextEncoder } from 'text-encoding';

if (typeof window.TextEncoder === 'undefined') {
  window.TextEncoder = TextEncoder;
}
