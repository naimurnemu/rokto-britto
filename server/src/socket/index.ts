import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config } from '../config';

/**
 * Singleton Pattern: Socket Manager
 * Encapsulates and guarantees a single Socket.io instance for WebSocket communications.
 */
export class SocketManager {
  private static instance: SocketIOServer | null = null;

  private constructor() {}

  public static initialize(server: HttpServer): SocketIOServer {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketIOServer(server, {
        cors: {
          origin: [config.app.clientOrigin, 'http://localhost:3000'],
          methods: ['GET', 'POST', 'PATCH'],
          credentials: true,
        },
      });

      SocketManager.instance.on('connection', (socket: Socket) => {
        console.log(`[Socket.io] Client connected: ${socket.id}`);

        socket.on('join_user_room', (userId: string) => {
          if (userId) {
            socket.join(`user_${userId}`);
          }
        });

        socket.on('join_request_room', (requestId: string) => {
          if (requestId) {
            socket.join(`request_${requestId}`);
          }
        });

        socket.on('join_chat_room', (sessionId: string) => {
          if (sessionId) {
            socket.join(`chat_${sessionId}`);
          }
        });

        socket.on('join_emergency_feed', () => {
          socket.join('emergency_feed');
        });

        socket.on('disconnect', () => {
          console.log(`[Socket.io] Client disconnected: ${socket.id}`);
        });
      });
    }

    return SocketManager.instance;
  }

  public static getInstance(): SocketIOServer | null {
    return SocketManager.instance;
  }
}

export const initSocketIO = (server: HttpServer): SocketIOServer => SocketManager.initialize(server);
export const getSocketIO = (): SocketIOServer | null => SocketManager.getInstance();
