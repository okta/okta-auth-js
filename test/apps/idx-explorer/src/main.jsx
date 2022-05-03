import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import 'semantic-ui-css/semantic.min.css'
import './main.css';

// react <=17
// ReactDOM.render(
//   <App />,
//   document.getElementById('root')
// );

// react >=18
createRoot(document.getElementById('root')).render(<App />);
