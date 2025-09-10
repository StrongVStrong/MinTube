/*
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
*/


import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export const searchVideos = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Missing search query' });

  try {
    const { stdout } = await execAsync(`yt-dlp -j "ytsearch5:${query}"`, {
      maxBuffer: 10 * 1024 * 1024,
    });

    const lines = stdout.trim().split('\n');
    const items = lines.map(line => {
      const data = JSON.parse(line);

      return {
        id: { videoId: data.id },
        snippet: {
          publishedAt: data.upload_date
            ? `${data.upload_date.slice(0, 4)}-${data.upload_date.slice(4, 6)}-${data.upload_date.slice(6)}T00:00:00Z`
            : null,
          title: data.title || '',
          description: data.description || '',
          channelTitle: data.channel || data.uploader || 'Unknown',
          thumbnails: {
            default: { url: data.thumbnail || `https://i.ytimg.com/vi/${data.id}/default.jpg` },
            medium: { url: `https://i.ytimg.com/vi/${data.id}/mqdefault.jpg` },
            high: { url: `https://i.ytimg.com/vi/${data.id}/hqdefault.jpg` }
          }
        },
        contentDetails: {
          duration: data.duration_string || formatDuration(data.duration)
        }
      };
    });

    res.json(items);
  } catch (err) {
    console.error('yt-dlp search failed:', err);
    res.status(500).json({ error: 'Failed to search videos' });
  }
};

function formatDuration(seconds) {
  if (!seconds) return 'PT0M0S';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `PT${h > 0 ? h + 'H' : ''}${m}M${s}S`;
}
