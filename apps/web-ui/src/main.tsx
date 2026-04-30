import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CasdoorProvider } from '@hquant/casdoor/client/react';
import { AppRouter } from './router';
import '@agent-flow/chat-ui/styles.css';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <CasdoorProvider
      config={{
        appName: import.meta.env.VITE_CASDOOR_APP_NAME || 'aflow',
        authApiBase: '/api',
        redirectUri: `${window.location.origin}/callback`,
        logoutRedirectUri: window.location.origin,
        storage: {
          type: 'localStorage',
          prefix: 'af_webui_',
          accessTokenKey: 'access_token',
        },
        silentRefresh: true,
      }}
    >
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </CasdoorProvider>,
);
