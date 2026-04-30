import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Theme } from '@radix-ui/themes';
import { CasdoorProvider } from '@hquant/casdoor/client/react';
import '@radix-ui/themes/styles.css';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CasdoorProvider
      config={{
        appName: import.meta.env.VITE_CASDOOR_APP_NAME || 'aflow',
        authApiBase: '/api',
        redirectUri: `${window.location.origin}/callback`,
        logoutRedirectUri: window.location.origin,
        storage: {
          type: 'localStorage',
          prefix: 'af_console_',
          accessTokenKey: 'access_token',
        },
        silentRefresh: true,
      }}
    >
      <Theme appearance="light" accentColor="indigo" grayColor="slate" radius="medium">
        <App />
      </Theme>
    </CasdoorProvider>
  </StrictMode>,
);
