import { Repository } from 'typeorm';
import type { AppDataSource } from '../db/data-source.js';
import { UserEntity, type UserRole } from '../db/entities/user.entity.js';
import { AppError } from '../lib/errors.js';

interface CasdoorUser {
  id: string;
  name: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  isAdmin?: boolean;
  isGlobalAdmin?: boolean;
  isForbidden?: boolean;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
}

interface VerifyResponse {
  valid: boolean;
  user?: CasdoorUser;
  claims?: Record<string, unknown>;
  error?: string;
}

interface UserResponse {
  user: CasdoorUser;
}

interface UrlResponse {
  url: string;
}

interface AuthServiceOptions {
  authApiBaseUrl: string;
  appName: string;
}

export interface LocalUserProfile {
  userId: string;
  username: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: 'active' | 'disabled';
  createdAt: string;
}

export class AuthService {
  private readonly userRepository: Repository<UserEntity>;

  constructor(
    db: AppDataSource,
    private readonly options: AuthServiceOptions,
  ) {
    this.userRepository = db.getRepository(UserEntity);
  }

  async createAuthorizeUrl(body: {
    appName?: string;
    redirectUri: string;
    state: string;
  }): Promise<UrlResponse> {
    return this.post<UrlResponse>(
      this.buildAppPath(body.appName, '/oauth/authorize-url'),
      {
        redirect_uri: body.redirectUri,
        state: body.state,
      },
    );
  }

  async createSignupUrl(body: {
    appName?: string;
    redirectUri: string;
    state: string;
    enablePassword?: boolean;
  }): Promise<UrlResponse> {
    return this.post<UrlResponse>(
      this.buildAppPath(body.appName, '/oauth/signup-url'),
      {
        redirect_uri: body.redirectUri,
        state: body.state,
        enable_password: body.enablePassword,
      },
    );
  }

  async exchangeCodeForToken(
    code: string,
    state: string,
    appName?: string,
  ): Promise<{ token: TokenResponse; user: LocalUserProfile }> {
    const result = await this.post<{ token: TokenResponse; user: CasdoorUser }>(
      this.buildAppPath(appName, '/oauth/token'),
      { code, state },
    );

    if (!result?.token?.access_token) {
      throw new AppError(502, 'UPSTREAM_AUTH_ERROR', 'Auth service returned invalid token payload');
    }
    if (!result.user?.id || !result.user.name) {
      throw new AppError(502, 'UPSTREAM_AUTH_ERROR', 'Auth service returned invalid user payload');
    }

    const localUser = await this.upsertLocalUser(result.user);

    return {
      token: result.token,
      user: toLocalUserProfile(localUser),
    };
  }

  async verifyAccessToken(token: string): Promise<{ user: LocalUserProfile; claims?: Record<string, unknown> }> {
    const result = await this.getMe(token);
    const remoteUser = result.user;

    const localUser = await this.upsertLocalUser(remoteUser);

    if (localUser.status !== 'active') {
      throw new AppError(403, 'FORBIDDEN', 'User is disabled');
    }

    return {
      user: toLocalUserProfile(localUser),
    };
  }

  async getUserProfileById(userId: string): Promise<LocalUserProfile> {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    return toLocalUserProfile(user);
  }

  async refreshToken(refreshToken: string, appName?: string): Promise<TokenResponse> {
    const token = await this.post<TokenResponse>(
      this.buildAppPath(appName, '/oauth/token/refresh'),
      { refresh_token: refreshToken },
    );

    if (!token?.access_token) {
      throw new AppError(502, 'UPSTREAM_AUTH_ERROR', 'Auth service returned invalid token payload');
    }

    return token;
  }

  async getMe(token: string): Promise<UserResponse> {
    const response = await this.get<UserResponse>('/api/me', {
      token,
    });

    if (!response?.user?.id || !response.user.name) {
      throw new AppError(502, 'UPSTREAM_AUTH_ERROR', 'Auth service returned invalid user payload');
    }

    return response;
  }

  private async upsertLocalUser(remoteUser: CasdoorUser): Promise<UserEntity> {
    const role: UserRole = remoteUser.isAdmin || remoteUser.isGlobalAdmin ? 'admin' : 'user';
    const status = remoteUser.isForbidden ? 'disabled' : 'active';

    const existing = await this.userRepository.findOne({ where: { userId: remoteUser.id } });

    if (!existing) {
      const created = this.userRepository.create({
        userId: remoteUser.id,
        username: remoteUser.name,
        displayName: remoteUser.displayName ?? null,
        email: remoteUser.email ?? null,
        avatarUrl: remoteUser.avatar ?? null,
        role,
        status,
      });
      return this.userRepository.save(created);
    }

    existing.username = remoteUser.name;
    existing.displayName = remoteUser.displayName ?? null;
    existing.email = remoteUser.email ?? null;
    existing.avatarUrl = remoteUser.avatar ?? null;
    existing.role = role;
    existing.status = status;

    return this.userRepository.save(existing);
  }

  private async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.options.authApiBaseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const message = await readUpstreamError(response);
      throw new AppError(
        response.status === 401 ? 401 : 502,
        response.status === 401 ? 'UNAUTHORIZED' : 'UPSTREAM_AUTH_ERROR',
        message,
      );
    }

    return (await response.json()) as T;
  }

  private async get<T>(path: string, query: Record<string, string>): Promise<T> {
    const search = new URLSearchParams(query).toString();
    const response = await fetch(`${this.options.authApiBaseUrl}${path}?${search}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const message = await readUpstreamError(response);
      throw new AppError(502, 'UPSTREAM_AUTH_ERROR', message);
    }

    return (await response.json()) as T;
  }

  private buildAppPath(appName: string | undefined, path: string): string {
    const targetAppName = appName?.trim() || this.options.appName;
    return `/api/apps/${encodeURIComponent(targetAppName)}${path}`;
  }
}

async function readUpstreamError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string; message?: string };
    if (data.error) return data.error;
    if (data.message) return data.message;
  } catch {
    // ignore
  }

  return `Auth upstream error: ${response.status}`;
}

function toLocalUserProfile(user: UserEntity): LocalUserProfile {
  return {
    userId: user.userId,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}
