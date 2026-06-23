import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function buildCorsOptions(): CorsOptions {
  const allowedOrigins = (
    process.env.ALLOWED_ORIGINS || 'http://localhost:5173'
  )
    .split(',')
    .map((o) => o.trim());

  const methods = (process.env.CORS_METHODS || 'GET,POST,PUT,PATCH,DELETE')
    .split(',')
    .map((m) => m.trim());

  const credentials = process.env.CORS_CREDENTIALS !== 'false';

  return {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods,
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials,
  };
}
