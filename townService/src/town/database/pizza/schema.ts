import mongoose from 'mongoose';

const pizzaSchema = new mongoose.Schema(
  {
    _id: String,
    orderId: String,
  },
  { collection: 'Pizza' },
);
export default pizzaSchema;
