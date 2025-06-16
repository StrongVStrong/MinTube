import express from 'express';
import { getRecommendations, getCachedRecommendations } from '../controllers/recommendationsController.js';

const router = express.Router();

router.get('/recommendations', getRecommendations);
router.get('/cached-recommendations', getCachedRecommendations);

export default router;
