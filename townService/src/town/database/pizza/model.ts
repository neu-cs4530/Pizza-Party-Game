import mongoose from 'mongoose';
import schema from './schema.js';

const model = mongoose.model('Pizza', schema);
export default model;
