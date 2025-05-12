import express from 'express';
import { addToHistory, getRecentHistory } from '../history.js';

const router = express.Router();

router.post('/', (req, res) => {
  const { videoId } = req.body;
  if (!videoId) return res.status(400).json({ error: 'Missing videoId' });

  addToHistory(videoId);
  res.status(200).json({ message: 'Video added to history' });
});

router.get('/', (req, res) => {
  res.json({ history: getRecentHistory(10) });
});

export default router;