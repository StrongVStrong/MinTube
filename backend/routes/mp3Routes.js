import express from 'express';
import { getMp3Stream } from '../controllers/wholemp3Controller.js';

const router = express.Router();

// Route to handle MP3 streaming
router.get('/get_mp3_stream', (req, res) => {
  console.log('Received request to /get_mp3_stream');
  getMp3Stream(req, res);  // This calls the function
});


export default router;
