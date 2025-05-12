import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const historyFile = path.join(__dirname, 'history.json');

const loadHistory = () => {
  try {
    const data = fs.readFileSync(historyFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading history file:', err);
    return [];
  }
};

const saveHistory = (history) => {
  try {
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  } catch (err) {
    console.error('Error writing history file:', err);
  }
};

export const addToHistory = (videoId) => {
  let history = loadHistory();
  history = history.filter(item => item !== videoId);
  history.unshift(videoId);
  if (history.length > 50) history.pop();
  saveHistory(history);
};

export const getRecentHistory = (count = 5) => {
  const history = loadHistory();
  return history.slice(0, count);
};
