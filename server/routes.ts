import express from 'express';
const app = express();
app.get('/api/notifications', (req, res) => {
  // Implement logic to return the number of new documents
  res.json({ count: 10 });
});
export default app;
