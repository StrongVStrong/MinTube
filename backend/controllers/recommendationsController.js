import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { getRecentHistory } from '../history.js';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const getRecommendations = async (req, res) => {
  const historyIds = getRecentHistory(5);
  const history = historyIds.map(id => ({ videoId: id }));

  try {
    // Step 1: Fetch video titles from YouTube API using the video IDs
    const videoTitles = [];
    
    for (const item of history) {
      const youtubeResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet',
          id: item.videoId,
          key: API_KEY,
        },
      });

      // Get the title of the video and store it in the array
      const title = youtubeResponse.data.items[0].snippet.title;
      videoTitles.push(title);
    }

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
    
    for (let topic of extractedTopics) {
      const youtubeResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          q: topic,
          type: 'video',
          maxResults: 5,
          key: API_KEY,
        },
      });

      // Process the YouTube recommendations
      const recommendations = youtubeResponse.data.items.map(item => ({
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));

      // Add these recommendations to the final list
      allRecommendations.push(...recommendations);
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
