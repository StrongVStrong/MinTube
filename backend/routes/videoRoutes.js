import express from 'express';
import { getVideoInfo } from '../controllers/videoInfoController.js';

const router = express.Router();
router.get('/video-info', getVideoInfo);

export default router;