import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const user = config.get<string>('MONGODB_USER');
        const password = config.get<string>('MONGODB_PASSWORD');
        const host = config.getOrThrow<string>('MONGODB_HOST');
        const port = config.getOrThrow<string>('MONGODB_PORT');
        const db = config.getOrThrow<string>('MONGODB_DB');

        const credentials = user && password ? `${user}:${password}@` : '';
        const authSource = credentials ? '?authSource=admin' : '';

        return {
          uri: `mongodb://${credentials}${host}:${port}/${db}${authSource}`,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
