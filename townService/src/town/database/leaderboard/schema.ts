import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    _id: String,
    playerId: String,
    score: Number,
  },
  { collection: 'Leaderboard' },
);
export default leaderboardSchema;
