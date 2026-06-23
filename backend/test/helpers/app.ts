import { Server } from 'http';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export interface TestApp {
  app: INestApplication;
  server: Server;
  mongod: MongoMemoryServer;
}

/**
 * Boots a full NestJS test application backed by an in-memory MongoDB instance.
 *
 * Call AFTER setTestEnv() — AppModule is required inside this function so that
 * ConfigModule.forRoot validates env vars only after they have been set.
 */
export async function createTestApp(): Promise<TestApp> {
  const mongod = await MongoMemoryServer.create();

  // MONGODB_PORT must be set before requiring AppModule because ConfigModule
  // calls validate() synchronously during module construction.
  process.env.MONGODB_PORT = String(mongod.instanceInfo!.port);

  /* eslint-disable @typescript-eslint/no-require-imports */
  const { AppModule } =
    require('../../src/app.module') as typeof import('../../src/app.module');
  /* eslint-enable @typescript-eslint/no-require-imports */

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  await app.init();

  const server = app.getHttpServer() as Server;

  const connection = app.get<Connection>(getConnectionToken());
  await connection.dropDatabase();

  return { app, server, mongod };
}

export async function closeTestApp(testApp: TestApp): Promise<void> {
  await testApp.app.close();
  await testApp.mongod.stop();
}
