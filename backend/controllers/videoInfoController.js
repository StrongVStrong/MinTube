import axios from 'axios';

/*
export const getVideoInfo = async (req, res) => {
  const { id } = req.query;

  try {
    // 1. Get video details
    const videoRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet,statistics',
        id,
        key: process.env.API_KEY,
      },
    });

    const video = videoRes.data.items[0].snippet;
    const stats = videoRes.data.items[0].statistics;

    // 2. Get channel info
    const channelRes = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet',
        id: video.channelId,
        key: process.env.API_KEY,
      },
    });

    const channelAvatar = channelRes.data.items[0].snippet.thumbnails.default.url;

    // 3. Build and send response
    res.json({
      title: video.title,
      channel: video.channelTitle,
      uploaded: video.publishedAt,
      views: `${Number(stats.viewCount).toLocaleString()} views`,
      channelAvatar,
    });
  } catch (err) {
    console.error('Error fetching video info:', err);
    res.status(500).json({ error: 'Failed to fetch video info' });
  }
};


*/



















import { exec } from 'child_process';

export const getVideoInfo = async (req, res) => {
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: 'Missing video ID' });

  const url = `https://www.youtube.com/watch?v=${id}`;

  exec(`yt-dlp -j "${url}"`, { maxBuffer: 1024 * 1000 }, (err, stdout, stderr) => {
    if (err) {
      console.error('yt-dlp error:', err);
      return res.status(500).json({ error: 'yt-dlp failed' });
    }

    try {
      const data = JSON.parse(stdout);

      res.json({
        title: data.title,
        channel: data.channel,
        uploaded: data.upload_date,
        views: `${Number(data.view_count).toLocaleString()} views`,
        channelAvatar: data.channel_favicon || null, // fallback if missing
        duration: data.duration_string || data.duration, // may vary
        thumbnail: data.thumbnail,
        description: data.description,
        tags: data.tags,
      });
    } catch (parseErr) {
      console.error('Failed to parse yt-dlp output:', parseErr);
      res.status(500).json({ error: 'Failed to parse yt-dlp output' });
    }
  });
};


