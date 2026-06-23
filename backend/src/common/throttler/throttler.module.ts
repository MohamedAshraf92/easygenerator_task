import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'global',
            ttl: config.getOrThrow<number>('THROTTLE_TTL_MS'),
            limit: config.getOrThrow<number>('THROTTLE_GLOBAL_LIMIT'),
          },
          {
            name: 'auth',
            ttl: config.getOrThrow<number>('THROTTLE_TTL_MS'),
            limit: config.getOrThrow<number>('THROTTLE_AUTH_LIMIT'),
          },
        ],
      }),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppThrottlerModule {}
