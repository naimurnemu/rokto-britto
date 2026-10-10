import { Server as SocketIOServer } from 'socket.io';
import { config } from '../config';
/**
 * Singleton Pattern: Socket Manager
 * Encapsulates and guarantees a single Socket.io instance for WebSocket communications.
 */
export class SocketManager {
    static instance = null;
    constructor() { }
    static initialize(server) {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketIOServer(server, {
                cors: {
                    origin: [config.app.clientOrigin, 'http://localhost:3000'],
                    methods: ['GET', 'POST', 'PATCH'],
                    credentials: true,
                },
            });
            SocketManager.instance.on('connection', (socket) => {
                console.log(`[Socket.io] Client connected: ${socket.id}`);
                socket.on('join_user_room', (userId) => {
                    if (userId) {
                        socket.join(`user_${userId}`);
                    }
                });
                socket.on('join_request_room', (requestId) => {
                    if (requestId) {
                        socket.join(`request_${requestId}`);
                    }
                });
                socket.on('join_chat_room', (sessionId) => {
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
    static getInstance() {
        return SocketManager.instance;
    }
}
export const initSocketIO = (server) => SocketManager.initialize(server);
export const getSocketIO = () => SocketManager.getInstance();
