import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </React.StrictMode>
); 