import axios from 'axios';

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