"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var core_exports = {};
__export(core_exports, {
  CasdoorClient: () => CasdoorClient,
  createCasdoorClient: () => createCasdoorClient
});
module.exports = __toCommonJS(core_exports);
var import_storage = require("./storage.js");
const OAUTH_LOGIN_PENDING_TTL_MS = 5 * 60 * 1e3;
const callbackExchangeInFlight = /* @__PURE__ */ new Map();
const callbackExchangeConsumed = /* @__PURE__ */ new Set();
class CasdoorClient {
  config;
  storage;
  listeners = /* @__PURE__ */ new Set();
  refreshTimer = null;
  loginRedirectInProgress = false;
  apiBase;
  state = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    accessToken: null,
    error: null
  };
  constructor(config) {
    this.config = {
      ...config,
      redirectUri: config.redirectUri ?? this.defaultRedirectUri()
    };
    this.apiBase = (config.authApiBase ?? "/api").replace(/\/+$/, "");
    this.storage = new import_storage.TokenStorage({
      type: config.storage?.type ?? "localStorage",
      ...config.storage,
      prefix: `${config.storage?.prefix ?? "casdoor_"}${config.appName}_`
    });
    this.initializeState();
  }
  defaultRedirectUri() {
    if (typeof window === "undefined") {
      return "/callback";
    }
    return `${window.location.origin}/callback`;
  }
  initializeState() {
    const token = this.storage.getAccessToken();
    const user = this.storage.getUser();
    if (token && !this.storage.isTokenExpired()) {
      this.updateState({
        isAuthenticated: true,
        isLoading: false,
        user,
        accessToken: token,
        error: null
      });
      if (this.config.silentRefresh) {
        this.setupRefreshTimer();
      }
      return;
    }
    this.updateState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
      error: null
    });
  }
  updateState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }
  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }
  getState() {
    return this.state;
  }
  generateState() {
    const array = new Uint8Array(16);
    if (typeof crypto !== "undefined") {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < 16; i += 1) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  getOAuthStateStorageKey() {
    return `casdoor_oauth_state_${this.config.appName}`;
  }
  getOAuthLoginPendingStorageKey() {
    return `casdoor_oauth_login_pending_${this.config.appName}`;
  }
  getCallbackExchangeKey(code, state) {
    return `${this.config.appName}:${state}:${code}`;
  }
  clearCallbackQueryParams() {
    if (typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    let changed = false;
    for (const key of ["code", "state", "error", "error_description"]) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    if (!changed) {
      return;
    }
    const search = url.searchParams.toString();
    window.history.replaceState({}, document.title, `${url.pathname}${search ? `?${search}` : ""}${url.hash}`);
  }
  hasPendingLoginRedirect() {
    if (typeof sessionStorage === "undefined") {
      return false;
    }
    const pendingAt = Number(sessionStorage.getItem(this.getOAuthLoginPendingStorageKey()));
    if (!Number.isFinite(pendingAt)) {
      return false;
    }
    if (Date.now() - pendingAt > OAUTH_LOGIN_PENDING_TTL_MS) {
      sessionStorage.removeItem(this.getOAuthLoginPendingStorageKey());
      return false;
    }
    return true;
  }
  markLoginRedirectPending() {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(this.getOAuthLoginPendingStorageKey(), Date.now().toString());
    }
  }
  clearLoginRedirectPending() {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(this.getOAuthLoginPendingStorageKey());
    }
  }
  async postJSON(path, body) {
    const response = await fetch(`${this.apiBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      let message = `request failed: ${response.status}`;
      try {
        const data = await response.json();
        message = data.message || data.error || message;
      } catch {
      }
      throw new Error(message);
    }
    return await response.json();
  }
  async getLoginUrl() {
    const state = this.generateState();
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(this.getOAuthStateStorageKey(), state);
    }
    const result = await this.postJSON(
      `/apps/${encodeURIComponent(this.config.appName)}/oauth/authorize-url`,
      {
        redirect_uri: this.config.redirectUri,
        state
      }
    );
    return result.url;
  }
  async getSignupUrl(enablePassword = true) {
    const state = this.generateState();
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(this.getOAuthStateStorageKey(), state);
    }
    const result = await this.postJSON(
      `/apps/${encodeURIComponent(this.config.appName)}/oauth/signup-url`,
      {
        redirect_uri: this.config.redirectUri,
        state,
        enable_password: enablePassword
      }
    );
    return result.url;
  }
  async login() {
    if (this.loginRedirectInProgress || this.hasPendingLoginRedirect()) {
      return;
    }
    this.loginRedirectInProgress = true;
    this.markLoginRedirectPending();
    try {
      const url = await this.getLoginUrl();
      window.location.href = url;
    } catch (err) {
      this.loginRedirectInProgress = false;
      this.clearLoginRedirectPending();
      throw err;
    }
  }
  async signup() {
    const url = await this.getSignupUrl(true);
    window.location.href = url;
  }
  logout() {
    this.storage.clear();
    this.clearRefreshTimer();
    this.clearLoginRedirectPending();
    this.updateState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
      error: null
    });
    const logoutUri = this.config.logoutRedirectUri;
    if (logoutUri) {
      window.location.href = logoutUri;
    }
  }
  async handleCallback(serverExchangeToken) {
    this.updateState({ isLoading: true });
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");
      if (error) {
        throw new Error(urlParams.get("error_description") || error);
      }
      if (!code) {
        throw new Error("No authorization code found");
      }
      if (!state) {
        throw new Error("No state found");
      }
      if (typeof sessionStorage !== "undefined") {
        const savedState = sessionStorage.getItem(this.getOAuthStateStorageKey());
        if (savedState && savedState !== state) {
          throw new Error("Invalid state parameter");
        }
        sessionStorage.removeItem(this.getOAuthStateStorageKey());
      }
      this.clearLoginRedirectPending();
      const exchangeKey = this.getCallbackExchangeKey(code, state);
      const exchange = serverExchangeToken ?? (async (authCode, authState, appName) => {
        return this.postJSON(
          `/apps/${encodeURIComponent(appName)}/oauth/token`,
          {
            code: authCode,
            state: authState
          }
        );
      });
      let exchangePromise = callbackExchangeInFlight.get(exchangeKey);
      if (!exchangePromise) {
        if (callbackExchangeConsumed.has(exchangeKey)) {
          throw new Error("Authorization code has already been processed");
        }
        callbackExchangeConsumed.add(exchangeKey);
        exchangePromise = exchange(code, state, this.config.appName).finally(() => {
          callbackExchangeInFlight.delete(exchangeKey);
        });
        callbackExchangeInFlight.set(exchangeKey, exchangePromise);
      }
      const { token, user } = await exchangePromise;
      this.storage.saveToken(token);
      this.storage.saveUser(user);
      this.updateState({
        isAuthenticated: true,
        isLoading: false,
        user,
        accessToken: token.access_token,
        error: null
      });
      if (this.config.silentRefresh) {
        this.setupRefreshTimer();
      }
      this.clearCallbackQueryParams();
      return true;
    } catch (err) {
      this.clearLoginRedirectPending();
      this.clearCallbackQueryParams();
      this.updateState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
        error: err instanceof Error ? err : new Error("Unknown error")
      });
      return false;
    }
  }
  async refreshToken(serverRefreshToken) {
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) {
      return false;
    }
    try {
      const refresh = serverRefreshToken ?? (async (token2, appName) => {
        return this.postJSON(
          `/apps/${encodeURIComponent(appName)}/oauth/token/refresh`,
          { refresh_token: token2 }
        );
      });
      const token = await refresh(refreshToken, this.config.appName);
      this.storage.saveToken(token);
      this.updateState({
        isAuthenticated: true,
        isLoading: false,
        accessToken: token.access_token,
        error: null
      });
      if (this.config.silentRefresh) {
        this.setupRefreshTimer();
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }
  setupRefreshTimer() {
    this.clearRefreshTimer();
    const expiresAt = this.storage.getExpiresAt();
    if (!expiresAt) return;
    const refreshBeforeExpiry = (this.config.refreshBeforeExpiry ?? 60) * 1e3;
    const timeout = expiresAt - Date.now() - refreshBeforeExpiry;
    if (timeout > 0) {
      this.refreshTimer = setTimeout(async () => {
        this.updateState({ isLoading: true });
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          this.updateState({ isLoading: false });
        }
      }, timeout);
    }
  }
  clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
  getAccessToken() {
    return this.storage.getAccessToken();
  }
  getUser() {
    return this.storage.getUser();
  }
  isAuthenticated() {
    return this.state.isAuthenticated;
  }
  destroy() {
    this.clearRefreshTimer();
    this.listeners.clear();
  }
}
function createCasdoorClient(config) {
  return new CasdoorClient(config);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CasdoorClient,
  createCasdoorClient
});
//# sourceMappingURL=core.cjs.map