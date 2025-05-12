import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadsDir = path.join(__dirname, '..', 'downloads');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
  console.log("Created 'downloads' directory.");
}

const generateUniqueFilename = (url) => {
  const hash = crypto.createHash('md5').update(url).digest('hex');
  return `${hash}.mp3`;
}

const deleteOldFiles = () => {
  fs.readdir(downloadsDir, (err, files) => {
    if (err) {
      console.error('Error reading the downloads directory:', err);
      return;
    }

    files.forEach(file => {
      if (file.endsWith('.mp3')) {
        const filePath = path.join(downloadsDir, file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${file}:`, err);
          } else {
            console.log(`Deleted old file: ${file}`);
          }
        });
      }
    });
  });
}

export const getMp3Stream = (req, res) => {
  const videoUrl = req.query.videoUrl;

  if (!videoUrl) {
    return res.status(400).json({ error: 'No video URL provided' });
  }

  const mp3FileName = generateUniqueFilename(videoUrl);
  const mp3FilePath = path.join(downloadsDir, mp3FileName);

  console.log("MP3 File Path: ", mp3FilePath);

  if (!fs.existsSync(mp3FilePath)) {
    deleteOldFiles();
  }

  // Check if the MP3 file already exists
  if (fs.existsSync(mp3FilePath)) {
    console.log('MP3 file already exists, skipping download.');
    return streamFile(req, mp3FilePath, res);
  }

  exec(`yt-dlp -x --audio-format mp3 --audio-quality 0 --force-overwrite ${videoUrl} -o ${mp3FilePath}`, (error, stdout, stderr) => {
    console.log("yt-dlp stdout:", stdout);
    console.error("yt-dlp stderr:", stderr);

    if (error) {
      return res.status(500).json({ error: `Error extracting audio: ${stderr}` });
    }

    fs.access(mp3FilePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('MP3 file does not exist after conversion');
        return res.status(500).json({ error: 'MP3 file does not exist after conversion' });
      }

      streamFile(req, mp3FilePath, res);
    });
  });
};

const streamFile = (req, mp3FilePath, res) => {
  const fileStats = fs.statSync(mp3FilePath);
  const fileSize = fileStats.size;

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', 'inline; filename=audio.mp3');
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Length', fileSize);

  const range = req.headers.range;
  if (range) {
    const [start, end] = range.replace(/bytes=/, '').split('-');
    const startByte = parseInt(start, 10);
    const endByte = end ? parseInt(end, 10) : fileSize - 1;
    const chunkSize = endByte - startByte + 1;

    res.status(206);
    res.setHeader('Content-Range', `bytes ${startByte}-${endByte}/${fileSize}`);
    res.setHeader('Content-Length', chunkSize);

    const stream = fs.createReadStream(mp3FilePath, { start: startByte, end: endByte });
    stream.pipe(res);

    stream.on('error', (err) => {
      console.error('Error streaming MP3 file:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming MP3 file' });
      }
    });

    stream.on('end', () => {
      console.log('MP3 streaming completed successfully.');
    });

  } else {
    const stream = fs.createReadStream(mp3FilePath);
    stream.pipe(res);

    stream.on('error', (err) => {
      console.error('Error streaming MP3 file:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming MP3 file' });
      }
    });

    stream.on('end', () => {
      console.log('MP3 streaming completed successfully.');
    });
  }
};
