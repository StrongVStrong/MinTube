import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function formatDuration(value) {
  // If it's already in a "m:ss" or "mm:ss" format, return as-is
  if (typeof value === 'string' && /^\d{1,2}:\d{2}$/.test(value)) {
    return value;
  }

  // Try to convert to number of seconds
  const seconds = Number(value);
  if (isNaN(seconds)) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    fetch(`/api/search?query=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
      console.log("Search results:", data);  // 👈 Add this line
      setResults(data);
    })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="bg-black min-h-screen text-white flex">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-20">
        <Header />
        <main className="pt-20 px-4">
          {loading && <div className="text-gray-400">Searching...</div>}
          {!loading && results.length === 0 && (
            <div className="text-gray-400">No results found for "{query}"</div>
          )}
          <div className="space-y-6">
            {results.map((item) => (
              <Link
            key={item.id.videoId}
            to={`/watch?v=${item.id.videoId}`}
            className="relative flex gap-4 hover:bg-gray-800 p-2 rounded-xl transition"
            >
            <div className="relative w-60">
                <img
                src={item.snippet.thumbnails.medium.url}
                alt=""
                className="aspect-video rounded-lg object-cover w-full"
                />
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                {formatDuration(item.contentDetails?.duration)}
                </div>
            </div>
            <div className="flex flex-col justify-between">
                <h2 className="text-lg font-semibold line-clamp-2">{item.snippet.title}</h2>
                <div className="text-sm text-gray-400">{item.snippet.channelTitle}</div>
                <div className="text-sm text-gray-500 mt-1">
                Published: {new Date(item.snippet.publishedAt).toLocaleDateString()}
                </div>
            </div>
            </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
