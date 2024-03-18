import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    _id: String,
    customerId: String,
    pointValue: Number,
  },
  { collection: 'Order' },
);
export default orderSchema;
