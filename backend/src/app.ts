import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { AppDataSource } from '@config/database';
import { appConfig } from '@config/app.config';
import routes from './routes';
import { errorHandler } from '@shared/middleware/error-handler';

// Załaduj zmienne środowiskowe
config({ path: '../.env' });

class App {
  public app: Application;
  private PORT: number;

  constructor() {
    this.app = express();
    this.PORT = appConfig.port;
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // CORS configuration
    this.app.use(cors({
      origin: appConfig.corsOrigin,
      credentials: true,
    }));

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging (development only)
    if (appConfig.nodeEnv === 'development') {
      this.app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        message: 'Osiedlowo API',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          users: '/api/users',
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
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
    this.app.listen(this.PORT, () => {
      console.log('🚀 Osiedlowo Backend');
      console.log(`📡 Server: http://localhost:${this.PORT}`);
      console.log(`🏥 Health: http://localhost:${this.PORT}/api/health`);
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
