import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './common/config/env.validation';
import { DatabaseModule } from './common/database/database.module';
import { LoggerModule } from './common/logger/logger.module';
import { FiltersModule } from './common/filters/filters.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    DatabaseModule,
    LoggerModule,
    FiltersModule,
    AuthModule,
  ],
})
export class AppModule {}
