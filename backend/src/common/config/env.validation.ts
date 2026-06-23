import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsString()
  MONGODB_HOST!: string;

  @IsNumber()
  MONGODB_PORT!: number;

  @IsString()
  MONGODB_DB!: string;

  @IsString()
  MONGODB_USER!: string;

  @IsString()
  MONGODB_PASSWORD!: string;

  @IsString()
  @MinLength(32)
  JWT_SECRET!: string;

  @IsNumber()
  PORT!: number;

  @IsString()
  FRONTEND_URL!: string;

  @IsString()
  ALLOWED_ORIGINS!: string;

  @IsString()
  CORS_METHODS!: string;

  @IsBoolean()
  CORS_CREDENTIALS!: boolean;

  @IsString()
  COOKIE_NAME!: string;

  @IsNumber()
  COOKIE_MAX_AGE_MS!: number;

  @IsBoolean()
  COOKIE_SECURE!: boolean;

  @IsString()
  COOKIE_SAME_SITE!: string;

  @IsString()
  @IsOptional()
  COOKIE_DOMAIN?: string;

  @IsNumber()
  THROTTLE_TTL_MS!: number;

  @IsNumber()
  THROTTLE_GLOBAL_LIMIT!: number;

  @IsNumber()
  THROTTLE_AUTH_LIMIT!: number;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length) {
    throw new Error(
      errors
        .map((e) => Object.values(e.constraints ?? {}).join(', '))
        .join('\n'),
    );
  }
  return validated;
}
