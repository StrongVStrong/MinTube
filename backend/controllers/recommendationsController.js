import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { getRecentHistory } from '../history.js';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
const execAsync = util.promisify(exec);
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const getCachedRecommendations = (req, res) => {
  const cachePath = path.resolve('public/cached-recommendations.json');

  try {
    const raw = fs.readFileSync(cachePath, 'utf-8');
    const cached = JSON.parse(raw);
    res.json({ recommendations: cached });
  } catch {
    res.status(404).json({ error: 'Cache not found' });
  }
};

export const getRecommendations = async (req, res) => {
  const historyIds = getRecentHistory(5);
  const history = historyIds.map(id => ({ videoId: id }));

  try {
    // Step 1: Fetch video titles from YouTube API using the video IDs

    const titleFetchPromises = history.map(async ({ videoId }) => {
        try {
          const { stdout } = await execAsync(`yt-dlp --print "%(title)s" "https://www.youtube.com/watch?v=${videoId}"`);
          return stdout.trim();
        } catch {
          return null;
        }
      });

      const videoTitles = (await Promise.all(titleFetchPromises)).filter(Boolean);

    // Step 2: Prepare the Gemini prompt with video titles
    const prompt = `
        You're an expert AI assistant for youtube lite.
        From the given video titles, EXTRACT and ONLY RETURN this JSON format:
        - \`topic\`: the relevant topic the video is about in order to search and find similar videos

        Return ONLY this format:
        For each video title, return a relevant topic. If there are N video titles, return N topics in this format:
        "topic": "..."
        "topic": "..."
        "topic": "..."
        (And so on, one for each video title).

        Ensure the topics correspond to the correct video and return ONLY this format with no explanations.

        Example output for 3 video titles:
        {"topic": "..."}
        {"topic": "..."}
        {"topic": "..."}

        Video Titles:
        ${videoTitles.join(", ")}
    `;

    // Step 3: Get topics from Gemini model using the prepared prompt
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    const topics = geminiResponse.text.split('\n');

    // Extract only the values of the "topic" field from each line
    const extractedTopics = topics.map(line => {
      const match = line.match(/"topic": "(.*?)"/);
      return match ? match[1] : null;
    }).filter(topic => topic !== null);

    console.log('Generated topics:', extractedTopics);

    // Step 4: Use the topics returned by Gemini to search YouTube for related videos
    const allRecommendations = [];
    
    for (const topic of extractedTopics) {
      try {
        const { stdout } = await execAsync(`yt-dlp -j --flat-playlist "ytsearch5:${topic}"`);

        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          const data = JSON.parse(line);
          allRecommendations.push({
            title: data.title || '(no title)',
            videoUrl: `https://www.youtube.com/watch?v=${data.id}`,
            thumbnail: `https://i.ytimg.com/vi/${data.id}/mqdefault.jpg`,
          });
        }
      } catch (err) {
        console.warn(`yt-dlp search failed for topic "${topic}":`, err.message);
      }
    }

    const cachePath = path.resolve('public/cached-recommendations.json');
    const cachedSubset = allRecommendations.slice(0, 10);
    try {
    const enriched = await Promise.all(
      cachedSubset.map(async (rec) => {
        const url = new URL(rec.videoUrl);
        const id = url.searchParams.get('v');

        try {
          const { stdout } = await execAsync(`yt-dlp -j "https://www.youtube.com/watch?v=${id}"`);
          const data = JSON.parse(stdout);

          return {
            id,
            title: data.title,
            thumbnail: rec.thumbnail,
            videoUrl: rec.videoUrl,
            channel: data.channel,
            channelAvatar: data.channel_favicon || null,
            views: data.view_count ? `${Number(data.view_count).toLocaleString()} views` : '0 views',
            uploaded: data.upload_date || null,
            duration: data.duration_string || '0:00',
          };
        } catch {
          return null; // skip if fetching fails
        }
      })
    );

    const filtered = enriched.filter(Boolean);

    let existing = [];
    if (fs.existsSync(cachePath)) {
      try {
        const raw = fs.readFileSync(cachePath, 'utf-8');
        existing = JSON.parse(raw);
      } catch {
        existing = [];
      }
    }

    const updated = [...filtered, ...existing].slice(0, 50);
    const seen = new Set();
    const deduped = updated.filter((v) => {
      const id = new URL(v.videoUrl).searchParams.get('v');
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    fs.writeFileSync(cachePath, JSON.stringify(deduped.slice(0, 50), null, 2), 'utf-8');
    console.log('Cached recommendations updated.');
  } catch (err) {
    console.warn('Failed to enrich/save cache:', err.message);
  }

    // Shuffle final list
    for (let i = allRecommendations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allRecommendations[i], allRecommendations[j]] = [allRecommendations[j], allRecommendations[i]];
    }

    // Return the recommendations as JSON response
    res.json({ recommendations: allRecommendations });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Error fetching recommendations' });
  }
};
