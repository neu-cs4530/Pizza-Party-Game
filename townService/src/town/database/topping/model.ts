import mongoose from 'mongoose';
import schema from './schema.js';

const model = mongoose.model('Topping', schema);
export default model;
