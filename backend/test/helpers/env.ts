/**
 * Sets all required env vars for E2E tests before AppModule is required.
 * Pass overrides to change specific values (e.g. a different throttle limit
 * or the MongoMemoryServer port).
 */
export function setTestEnv(overrides: Record<string, string> = {}): void {
  const defaults: Record<string, string> = {
    NODE_ENV: 'test',
    MONGODB_HOST: 'localhost',
    MONGODB_DB: 'test',
    MONGODB_USER: '',
    MONGODB_PASSWORD: '',
    JWT_SECRET: 'test-secret-that-is-long-enough-32chars',
    PORT: '3002',
    FRONTEND_URL: 'http://localhost:5173',
    ALLOWED_ORIGINS: 'http://localhost:5173',
    CORS_METHODS: 'GET,POST,PUT,PATCH,DELETE',
    CORS_CREDENTIALS: 'true',
    COOKIE_NAME: 'access_token',
    COOKIE_SECURE: 'false',
    COOKIE_SAME_SITE: 'lax',
    COOKIE_MAX_AGE_MS: '604800000',
    THROTTLE_TTL_MS: '60000',
    THROTTLE_GLOBAL_LIMIT: '1000',
    THROTTLE_AUTH_LIMIT: '1000',
  };

  const merged = { ...defaults, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    process.env[key] = value;
  }
}
