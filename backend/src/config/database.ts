import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { appConfig } from './app.config';
import { User } from '@entities/user.entity';
import { Conversation } from '@entities/conversation.entity';
import { Message } from '@entities/message.entity';
import { ConversationParticipant } from '@entities/conversation-participant.entity';
import { Neighborhood } from '@entities/neighborhood.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.database,
  synchronize: false,
  logging: appConfig.nodeEnv === 'development',
  entities: [User, Conversation, Message, ConversationParticipant, Neighborhood],

  migrations: ['src/migrations/*.ts'],
  migrationsRun: true, // Automatycznie uruchamia migracje przy starcie
  subscribers: ['src/subscribers/*.ts'],
});