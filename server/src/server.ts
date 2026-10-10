import http from 'http';
import app from './app';
import { config } from './config';
import { initSocketIO } from './socket';

const server = http.createServer(app);

// Initialize real-time Socket.io engine
const io = initSocketIO(server);

// Start listening
const PORT = config.app.port;
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🩸 Rokto Britto Express Server Running on port ${PORT}`);
  console.log(`📡 Environment: ${config.app.env}`);
  console.log(`🌐 Real-time Socket.io initialized`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`===================================================`);
});

// Handle graceful shutdown
const handleShutdown = (signal: string) => {
  console.log(`\n[Server] Received ${signal}. Closing gracefully...`);
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export { server, io };
export default server;
