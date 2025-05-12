import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../tailwind.css';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const videoTemplates = [
    { youtubeId: "c-ALLjLqFmM" },
    { youtubeId: "goS8fzIV38A" }
    ];

  const loadVideos = useCallback(() => {
    setLoading(true);

    const newVideoPromises = Array.from({ length: 20 }, async (_, i) => {
        const index = i + videos.length;
        const base = videoTemplates[index % videoTemplates.length];
        const { youtubeId } = base;

        try {
        const res = await fetch(`/api/video-info?id=${youtubeId}`);
        const data = await res.json();

        return {
            id: youtubeId,
            thumbnail: `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`,
            duration: `${Math.floor(Math.random() * 10) + 1}:${Math.floor(Math.random() * 60)
            .toString()
            .padStart(2, "0")}`,
            ...data
        };
        } catch (err) {
        console.error("Failed to fetch video info:", err);
        return {
            id: youtubeId,
            title: "Unavailable",
            channel: "Unknown",
            views: "0 views",
            uploaded: "Unknown",
            channelAvatar: "https://via.placeholder.com/80",
            thumbnail: `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`,
            duration: "0:00"
        };
        }
    });

    Promise.all(newVideoPromises).then((resolvedVideos) => {
        setVideos((prev) => [...prev, ...resolvedVideos]);
        setLoading(false);
    });
    }, [videos.length]);


  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (loading) return;
      
      if (window.innerHeight + document.documentElement.scrollTop + 300 >= 
          document.documentElement.offsetHeight) {
        loadVideos();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadVideos]);

  return (
    <div className="bg-black min-h-screen w-full overflow-x-hidden flex">
      {/* Sidebar */}
      <div className="w-64 fixed h-full bg-black text-white pt-23 hidden md:block">
        <div className="flex flex-col space-y-6 p-4">
          <a href="#" className="flex items-center space-x-3 text-white bg-gray-800 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Home</span>
          </a>
          <a href="#" className="flex items-center space-x-3 text-gray-400 hover:text-white p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 bg-black z-10 flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center">
            <div className="text-red-600 font-bold text-2xl mr-4">
                <a 
                    href="/"
                    className="hover:text-red-400 transition-colors duration-200 cursor-pointer"
                >
                    MinTube
                </a>
            </div>
            <button className="md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-full border border-gray-700 focus:outline-none focus:border-blue-500"
              />
              <button className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-600"></div>
          </div>
        </header>

        {/* Video Grid */}
        <main className="pt-21 pb-4 px-4">
          <style jsx global>{`
            html, body {
              overflow-x: hidden;
              width: 100%;
              margin: 0;
              padding: 0;
            }
            .line-clamp-2 {
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
          `}</style>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {videos.map((video) => (
            <div key={video.id} className="group">
                <Link 
                    to={`/watch?v=${video.id}`}
                    state={{ video }}
                    key={video.id}
                    className="group"
                >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-800">
                    <img
                    src={video.thumbnail}
                    alt=""
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                    loading="lazy"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {video.duration}
                    </div>
                </div>
                </Link>
                
                <div className="mt-3 flex gap-2">
                <div className="flex-shrink-0 sm:hidden">
                    <img
                    src={video.channelAvatar}
                    alt=""
                    className="w-9 h-9 rounded-full"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <Link to={`/watch?v=${video.id}`} className="text-white font-medium text-sm line-clamp-2 hover:text-red-500">
                    {video.title}
                    </Link>
                    <div className="text-gray-400 text-xs mt-1">
                    {video.channel}
                    </div>
                    <div className="text-gray-400 text-xs">
                    {video.views} • {video.uploaded}
                    </div>
                </div>
                </div>
            </div>
            ))}
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
              {[...Array(10)].map((_, i) => (
                <div key={`loading-${i}`} className="animate-pulse">
                  <div className="bg-gray-700 aspect-video rounded-lg"></div>
                  <div className="mt-3 flex gap-2">
                    <div className="bg-gray-700 w-9 h-9 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-gray-700 h-4 rounded"></div>
                      <div className="bg-gray-700 h-3 rounded w-3/4"></div>
                      <div className="bg-gray-700 h-3 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;