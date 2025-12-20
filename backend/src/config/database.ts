import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { appConfig } from './app.config';
import { User } from '@entities/user.entity';
import { Conversation } from '@entities/conversation.entity';
import { Message } from '@entities/message.entity';
import { ConversationParticipant } from '@entities/conversation-participant.entity';
import { Neighborhood } from '@entities/neighborhood.entity';
import { Announcement } from '@entities/announcement.entity';
import { AnnouncementResponse } from '@entities/announcement-response.entity';
import { AnnouncementView } from '@entities/announcement-view.entity';
import { Notification } from '@entities/notification.entity';
import { BlockedUser } from '@entities/blocked-user.entity';
import { Rating } from '@entities/rating.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.database,
  synchronize: false,
  logging: false,
  entities: [User, Conversation, Message, ConversationParticipant, Neighborhood, Announcement, AnnouncementResponse, AnnouncementView, Notification, BlockedUser, Rating],

  migrations: ['src/migrations/*.ts'],
  migrationsRun: true, 
  subscribers: ['src/subscribers/*.ts'],
});