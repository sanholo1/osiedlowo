import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { appConfig } from './app.config';
import { User } from '@modules/user/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.database,
  synchronize: appConfig.nodeEnv === 'development',
  logging: appConfig.nodeEnv === 'development',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});