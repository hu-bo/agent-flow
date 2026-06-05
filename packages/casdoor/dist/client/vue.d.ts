import { DeepReadonly, Ref } from 'vue';
import { CasdoorUser, TokenResponse, ClientConfig } from '../types.js';
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
 * 初始化 Casdoor 客户端 (应在应用入口调用一次)
 */
declare function initCasdoor(config: ClientConfig): CasdoorClient;
/**
 * 获取全局客户端实例
 */
declare function getCasdoorClient(): CasdoorClient;
interface UseCasdoorReturn {
    /** 是否已认证 */
    isAuthenticated: DeepReadonly<Ref<boolean>>;
    /** 是否正在加载 */
    isLoading: DeepReadonly<Ref<boolean>>;
    /** 当前用户 */
    user: DeepReadonly<Ref<CasdoorUser | null>>;
    /** Access Token */
    accessToken: DeepReadonly<Ref<string | null>>;
    /** 错误信息 */
    error: DeepReadonly<Ref<Error | null>>;
    /** 跳转到登录页 */
    login: () => Promise<void>;
    /** 跳转到注册页 */
    signup: () => Promise<void>;
    /** 登出 */
    logout: () => void;
    /** 处理 OAuth 回调 */
    handleCallback: (serverExchangeToken?: ServerExchangeToken) => Promise<boolean>;
    /** 刷新 Token */
    refreshToken: (serverRefreshToken?: (refreshToken: string, appName: string) => Promise<TokenResponse>) => Promise<boolean>;
    /** 获取客户端实例 */
    getClient: () => CasdoorClient;
}
/**
 * Vue Composable - Casdoor 认证
 */
declare function useCasdoor(): UseCasdoorReturn;
/**
 * Vue Composable - 仅用于回调页面
 */
declare function useCasdoorCallback(options?: CasdoorCallbackOptions): {
    isLoading: DeepReadonly<Ref<boolean>>;
    success: DeepReadonly<Ref<boolean>>;
    error: DeepReadonly<Ref<Error | null>>;
};
declare function useCasdoorCallback(serverExchangeToken?: ServerExchangeToken, options?: CasdoorCallbackOptions): {
    isLoading: DeepReadonly<Ref<boolean>>;
    success: DeepReadonly<Ref<boolean>>;
    error: DeepReadonly<Ref<Error | null>>;
};

export { type CasdoorCallbackOptions, type UseCasdoorReturn, getCasdoorClient, initCasdoor, useCasdoor, useCasdoorCallback };
