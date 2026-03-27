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
import { AdminLog } from '@entities/admin-log.entity';
import { SystemAnnouncement } from '@entities/system-announcement.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.database,
  synchronize: true,
  logging: false,
  entities: [User, Conversation, Message, ConversationParticipant, Neighborhood, Announcement, AnnouncementResponse, AnnouncementView, Notification, BlockedUser, Rating, AdminLog, SystemAnnouncement],

  migrations: ['src/migrations/*.ts'],
  migrationsRun: false,
  subscribers: ['src/subscribers/*.ts'],
});