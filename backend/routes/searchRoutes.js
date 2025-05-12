import express from 'express';
import { searchVideos } from '../controllers/searchController.js';

const router = express.Router();

router.get('/search', searchVideos);

export default router;
