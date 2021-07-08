// polyfill TextEncoder for IE Edge
import { TextEncoder } from 'text-encoding';

if (typeof window.TextEncoder === 'undefined') {
  window.TextEncoder = TextEncoder;
}
