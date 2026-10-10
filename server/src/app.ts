import express, { Application, Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config';
import apiRouter from './modules';
import { errorHandler } from './middlewares/errorHandler';

/**
 * Functional RequestHandler: Root API welcome information
 */
export const rootHandler: RequestHandler = (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Rokto Britto (রক্ত বৃত্ত) API - Location Based Live Blood Info System',
    version: '1.0.0',
    status: 'ONLINE',
    endpoints: {
      health: '/api/health',
      api: '/api',
    },
  });
};

/**
 * Pure Functional Factory: Creates and configures the Express application pipeline
 */
export const createApp = (): Application => {
  const app: Application = express();

  // Core Middlewares
  app.use(
    cors({
      origin: [config.app.clientOrigin, 'http://localhost:3000'],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging in development/production (skip in test)
  if (!config.app.isTest) {
    app.use(morgan('dev'));
  }

  // Root Information Route
  app.get('/', rootHandler);

  // Mount Modular API Routes under /api
  app.use('/api', apiRouter);

  // Global Centralized Error Handler Middleware
  app.use(errorHandler);

  return app;
};

export const app: Application = createApp();
export default app;
