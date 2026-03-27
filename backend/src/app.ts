import 'reflect-metadata';
import express, { Application } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config } from 'dotenv';
import { AppDataSource } from '@config/database';
import { appConfig } from '@config/app.config';
import routes from './routes';
import { globalExceptionHandler } from './exceptions';
import { initializeSocket } from './socket';

config({ path: '../.env' });

class App {
  public app: Application;
  private httpServer;
  private PORT: number;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.PORT = appConfig.port;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSocket();
  }

  private initializeMiddlewares(): void {
    this.app.use(cors({
      origin: appConfig.corsOrigin,
      credentials: true,
    }));

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(express.static('public'));


  }

  private initializeRoutes(): void {
    this.app.use('/api', routes);

    this.app.get('/', (req, res) => {
      res.json({
        message: 'Osiedlowo API',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          users: '/api/users',
          chat: '/api/chat',
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(globalExceptionHandler);
  }

  private initializeSocket(): void {
    initializeSocket(this.httpServer);
  }

  public async initializeDatabase(): Promise<void> {
    try {
      await AppDataSource.initialize();
      console.log('✅ Połączono z bazą danych');
    } catch (error) {
      console.error('❌ Błąd połączenia z bazą danych:', error);
      throw error;
    }
  }

  public listen(): void {
    this.httpServer.listen(this.PORT, () => {
      console.log('🚀 Osiedlowo Backend');
      console.log(`📡 Server: http://localhost:${this.PORT}`);
      console.log(`🏥 Health: http://localhost:${this.PORT}/api/health`);
      console.log(`💬 Chat: http://localhost:${this.PORT}/api/chat`);
      console.log(`⚡ WebSocket: ws://localhost:${this.PORT}`);
      console.log(`🌍 Environment: ${appConfig.nodeEnv}`);
    });
  }
}

const application = new App();

application
  .initializeDatabase()
  .then(() => {
    application.listen();
  })
  .catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });

export default application.app;
