import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './style.css';

console.log('MAIN JSX IS EXECUTING!');

try {
  const rootEl = document.getElementById('root');
  console.log('Root element found:', !!rootEl);
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  console.log('Root rendered successfully');
} catch (err) {
  console.error('CRITICAL ERROR RENDERING ROOT:', err);
  document.body.innerHTML = '<div style="color: red; padding: 20px; font-family: monospace;"><h1>Frontend Render Error</h1><pre>' + err.stack + '</pre></div>';
}
