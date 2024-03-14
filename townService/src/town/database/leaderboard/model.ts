import mongoose from 'mongoose';
import schema from './schema.js';

const model = mongoose.model('Leaderboard', schema);
export default model;
