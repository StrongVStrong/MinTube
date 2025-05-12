import express from 'express';
import searchRoutes from './routes/searchRoutes.js';
import recommendationsRoutes from './routes/recommendationRoutes.js';
import mp3Routes from './routes/mp3Routes.js';
import cors from 'cors';
import historyRoutes from './routes/historyRoutes.js';
import videoRoutes from './routes/videoRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', searchRoutes);
app.use('/api', recommendationsRoutes);
app.use('/api', mp3Routes);
app.use('/api/history', historyRoutes);
app.use('/api', videoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
