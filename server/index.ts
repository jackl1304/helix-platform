/**
 * Main Server Entry Point
 * 
 * This file serves as the main entry point for the Helix Platform server.
 * It imports and starts the server from the backend directory.
 */

// Import the server startup function from backend
import startServer from '../backend/src/server';

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default startServer;

