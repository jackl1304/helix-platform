import startServer from '../backend/src/server';
startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
export default startServer;
//# sourceMappingURL=index.js.map