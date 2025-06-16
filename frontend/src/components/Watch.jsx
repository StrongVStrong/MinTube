import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Link } from 'react-router-dom';

export default function Watch() {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('v');
  const [videoInfo, setVideoInfo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!videoId) return;

    // Log to history
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    }).catch((err) => console.error("Failed to log video to history:", err));

    // Fetch video info
    fetch(`/api/video-info?id=${videoId}`)
      .then(res => res.json())
      .then(data => setVideoInfo(data))
      .catch(err => console.error("Failed to fetch video info:", err));

    // Fetch cached recommendations
    fetch('/api/cached-recommendations')
      .then(res => res.json())
      .then(data => {
        const vids = Array.isArray(data) ? data : data.recommendations || [];
        setRecommendations(vids.filter(v => v.id !== videoId).slice(0, 10));
      })
      .catch(err => console.error("Failed to fetch recommendations:", err));
  }, [videoId]);

  if (!videoId) {
    return <div className="text-white p-6">Missing video ID.</div>;
  }

  return (
    <div className="bg-black text-white min-h-screen flex">
      <Sidebar />

      <div className="flex-1 ml-0 md:ml-20">
        <Header />

        <main className="pt-20 px-4">
          <div className="flex flex-col lg:flex-row gap-6 w-full">
            <div className="flex-[0.9] w-full">
              <div className="w-full aspect-video bg-black overflow-hidden rounded-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title="YouTube Video"
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>

              <div className="mt-4">
                <h1 className="text-xl font-bold">
                  {(videoInfo?.title?.slice(0, videoInfo.title.lastIndexOf('@')) || videoInfo?.title || 'Loading title...').trim()}
                </h1>
                <div className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                  <span>{videoInfo?.views || '...'}</span>
                  <span>•</span>
                  <span>{videoInfo?.uploaded || '...'}</span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <img
                    src={videoInfo?.channelAvatar || 'https://via.placeholder.com/80'}
                    className="w-10 h-10 rounded-full"
                    alt="Channel avatar"
                  />
                  <div>
                    <div className="font-semibold">{videoInfo?.channel || '...'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations using cached videos */}
            <div className="flex-[0.25] space-y-4">
              {recommendations.map((video) => (
                <Link
                  key={video.id}
                  to={`/watch?v=${video.id}`}
                  state={{ video }}
                  className="flex gap-3 hover:bg-gray-800 rounded-lg p-2 transition"
                >
                  <div className="w-32 aspect-video bg-gray-700 rounded overflow-hidden">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold line-clamp-2">{video.title}</div>
                    <div className="text-xs text-gray-400">{video.channel}</div>
                    <div className="text-xs text-gray-500">{video.views} • {video.uploaded}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
