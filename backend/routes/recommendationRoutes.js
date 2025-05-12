import express from 'express';
import { getRecommendations } from '../controllers/recommendationsController.js';

const router = express.Router();

router.get('/recommendations', getRecommendations);

export default router;
