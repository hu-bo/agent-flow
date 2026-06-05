import { ReactNode } from 'react';
import { ClientConfig, CasdoorUser, TokenResponse } from '../types.js';
import { CasdoorClient } from './core.js';

type ServerExchangeToken = (code: string, state: string, appName: string) => Promise<{
    token: TokenResponse;
    user: CasdoorUser;
}>;
interface CasdoorCallbackOptions {
    onSuccess?: (user: CasdoorUser) => void;
    onError?: (error: Error) => void;
}
/**
 * Casdoor Provider Props
 */
interface CasdoorProviderProps {
    config: ClientConfig;
    children: ReactNode;
}
/**
 * Casdoor Provider 组件
 */
declare function CasdoorProvider({ config, children }: CasdoorProviderProps): ReactNode;
/**
 * 获取 Casdoor 客户端
 */
declare function useCasdoorClient(): CasdoorClient;
interface UseCasdoorReturn {
    /** 是否已认证 */
    isAuthenticated: boolean;
    /** 是否正在加载 */
    isLoading: boolean;
    /** 当前用户 */
    user: CasdoorUser | null;
    /** Access Token */
    accessToken: string | null;
    /** 错误信息 */
    error: Error | null;
    /** 跳转到登录页 */
    login: () => Promise<void>;
    /** 跳转到注册页 */
    signup: () => Promise<void>;
    /** 登出 */
    logout: () => void;
    /** 获取登录 URL（不跳转） */
    getLoginUrl: () => Promise<string>;
    /** 获取注册 URL（不跳转） */
    getSignupUrl: () => Promise<string>;
    /** 处理 OAuth 回调 */
    handleCallback: (serverExchangeToken?: ServerExchangeToken) => Promise<boolean>;
    /** 刷新 Token */
    refreshToken: (serverRefreshToken?: (refreshToken: string, appName: string) => Promise<TokenResponse>) => Promise<boolean>;
}
/**
 * React Hook - Casdoor 认证
 */
declare function useCasdoor(): UseCasdoorReturn;
/**
 * React Hook - 仅用于回调页面
 */
declare function useCasdoorCallback(options?: CasdoorCallbackOptions): {
    isLoading: boolean;
    success: boolean;
    error: Error | null;
};
declare function useCasdoorCallback(serverExchangeToken?: ServerExchangeToken, options?: CasdoorCallbackOptions): {
    isLoading: boolean;
    success: boolean;
    error: Error | null;
};
/**
 * React Hook - 需要认证的路由保护
 */
declare function useRequireAuth(options?: {
    redirectTo?: string;
    enabled?: boolean;
}): {
    isAuthenticated: boolean;
    isLoading: boolean;
};

export { type CasdoorCallbackOptions, CasdoorProvider, type CasdoorProviderProps, type UseCasdoorReturn, useCasdoor, useCasdoorCallback, useCasdoorClient, useRequireAuth };
