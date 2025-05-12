import { useState, useRef } from 'react';

export default function AudioPlayer() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const [audioReady, setAudioReady] = useState(false);

  const handlePlay = async (e) => {
    e.preventDefault();

    if (!url) {
      setError('Please enter a YouTube URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAudioReady(false);

    try {
      const backendUrl = `http://localhost:5000/api/get_mp3_stream?videoUrl=${encodeURIComponent(url)}`;
      console.log("Request URL:", backendUrl);

      const audioElement = audioRef.current;
      audioElement.src = backendUrl;

      await new Promise((resolve, reject) => {
        audioElement.addEventListener('canplay', resolve, { once: true });
        
        audioElement.addEventListener('error', () => {
          reject(new Error('Audio load failed'));
        }, { once: true });

        audioElement.load();
      });

      try {
        await audioElement.play();
        setAudioReady(true);
      } catch (playErr) {
        console.log('Playback requires user interaction');
        setAudioReady(true);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to load audio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>YouTube Audio Player</h1>

      <form onSubmit={handlePlay} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter YouTube URL"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button type="submit" disabled={isLoading} style={{ padding: '8px 16px' }}>
          {isLoading ? 'Loading...' : 'Load Audio'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {error}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <audio
          ref={audioRef}
          controls
          style={{ width: '100%', display: audioReady ? 'block' : 'none' }}
          onError={(e) => {
            console.error('Audio error:', e.target.error);
            setError('Playback failed - try another video');
          }}
        />
      </div>
    </div>
  );
}
