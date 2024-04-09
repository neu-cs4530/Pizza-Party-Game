import axios from 'axios';

export const BASE_API = process.env.REACT_APP_BASE_API_URL || 'http://localhost:8081';

export const createLeaderboardEntry = async (entry: any) => {
  const response = await axios.post(`${BASE_API}/leaderboard`, entry);
  return response.data;
};

export const retrieveAllLeaderboardData = async () => {
  const response = await axios.get(`${BASE_API}/leaderboard`);
  return response.data;
};

export const retieveScoresByPlayer = async (playerId: any) => {
  const response = await axios.get(`${BASE_API}/leaderboard/${playerId}`);
  return response.data;
};
