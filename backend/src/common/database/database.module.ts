import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: `mongodb://${config.getOrThrow('MONGODB_USER')}:${config.getOrThrow('MONGODB_PASSWORD')}@${config.getOrThrow('MONGODB_HOST')}:${config.getOrThrow('MONGODB_PORT')}/${config.getOrThrow('MONGODB_DB')}?authSource=admin`,
      }),
    }),
  ],
})
export class DatabaseModule {}
