import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
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
