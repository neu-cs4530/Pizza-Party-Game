import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    _id: String,
    name: String,
    playerId: String,
  },
  { collection: 'Customer' },
);
export default customerSchema;
