import { z } from 'zod';

export const tokenExchangeBodySchema = z.object({
  code: z.string().trim().min(1),
  state: z.string().trim().min(1),
});

export const tokenRefreshBodySchema = z.object({
  refresh_token: z.string().trim().min(1),
});

export const oauthUrlBodySchema = z.object({
  redirect_uri: z.string().trim().min(1),
  state: z.string().trim().min(1),
  enable_password: z.boolean().optional(),
});
