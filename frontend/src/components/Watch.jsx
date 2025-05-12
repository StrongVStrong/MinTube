import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

export default function Watch() {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get('v');

  useEffect(() => {
    if (videoId) {
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      }).catch((err) => console.error("Failed to log video to history:", err));
    }
  }, [videoId]);

  if (!videoId) {
    return <div className="text-white p-6">Missing video ID.</div>;
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6 w-full px-2">
        {/* Video Player*/}
        <div className="flex-[0.9] w-full mt-2 lg:mt-3">
          <div className="w-full aspect-video bg-black overflow-hidden rounded-lg">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="YouTube Video"
              className="w-full h-full"
              allowFullScreen
            />
          </div>

          <div className="mt-4">
            <h1 className="text-xl font-bold"> {videoId}</h1>
          </div>
        </div>

        {/* Recommendations */}
        <div className="flex-[0.25] space-y-4 mt-2 lg:mt-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-32 aspect-video bg-gray-700 rounded"></div>
              <div className="flex-1">
                <div className="text-sm font-semibold line-clamp-2">Recommended Video Title #{i + 1}</div>
                <div className="text-xs text-gray-400">Channel Name</div>
                <div className="text-xs text-gray-500">1.2M views • 2 days ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}