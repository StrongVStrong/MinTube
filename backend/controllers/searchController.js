import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.API_KEY;

const searchVideos = async (req, res) => {
  const { query } = req.query;

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 5,
        key: API_KEY,
      },
    });

    res.json(response.data.items);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching YouTube data' });
  }
};

export { searchVideos };
