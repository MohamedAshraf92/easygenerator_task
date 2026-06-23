import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';

export function buildCookieOptions(config: ConfigService): CookieOptions {
  return {
    httpOnly: true,
    secure: config.get<boolean>('COOKIE_SECURE'),
    sameSite: config.get<string>('COOKIE_SAME_SITE') as
      | 'strict'
      | 'lax'
      | 'none',
    maxAge: config.get<number>('COOKIE_MAX_AGE_MS'),
    ...(config.get<string>('COOKIE_DOMAIN') && {
      domain: config.get<string>('COOKIE_DOMAIN'),
    }),
  };
}
