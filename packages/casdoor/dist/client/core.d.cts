import { AuthState, ClientConfig, TokenResponse, CasdoorUser } from '../types.cjs';

type AuthStateListener = (state: AuthState) => void;
type TokenExchangeResult = {
    token: Pick<TokenResponse, 'access_token'> & Partial<TokenResponse>;
    user: CasdoorUser;
};
declare class CasdoorClient {
    private config;
    private storage;
    private listeners;
    private refreshTimer;
    private loginRedirectInProgress;
    private apiBase;
    private state;
    constructor(config: ClientConfig);
    private defaultRedirectUri;
    private initializeState;
    private updateState;
    subscribe(listener: AuthStateListener): () => void;
    getState(): AuthState;
    private generateState;
    private getOAuthStateStorageKey;
    private getOAuthLoginPendingStorageKey;
    private getCallbackExchangeKey;
    private clearCallbackQueryParams;
    private hasPendingLoginRedirect;
    private markLoginRedirectPending;
    private clearLoginRedirectPending;
    private postJSON;
    getLoginUrl(): Promise<string>;
    getSignupUrl(enablePassword?: boolean): Promise<string>;
    login(): Promise<void>;
    signup(): Promise<void>;
    logout(): void;
    handleCallback(serverExchangeToken?: (code: string, state: string, appName: string) => Promise<TokenExchangeResult>): Promise<boolean>;
    refreshToken(serverRefreshToken?: (refreshToken: string, appName: string) => Promise<TokenResponse>): Promise<boolean>;
    private setupRefreshTimer;
    private clearRefreshTimer;
    getAccessToken(): string | null;
    getUser(): CasdoorUser | null;
    isAuthenticated(): boolean;
    destroy(): void;
}
declare function createCasdoorClient(config: ClientConfig): CasdoorClient;

export { type AuthStateListener, CasdoorClient, createCasdoorClient };
