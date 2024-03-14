import mongoose from 'mongoose';
import schema from './schema.js';

const model = mongoose.model('Customer', schema);
export default model;
