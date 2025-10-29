import { config } from 'dotenv';
import type { SignOptions } from 'jsonwebtoken';

config();

export const appConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307', 10),
    username: process.env.DB_USERNAME || 'osiedlowo_user',
    password: process.env.DB_PASSWORD || 'osiedlowo_password',
    database: process.env.DB_DATABASE || 'osiedlowo_db',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
    expiresIn: '24h' as SignOptions['expiresIn'],
  },

  disableAuth: process.env.DISABLE_AUTH === 'true' || false,
};