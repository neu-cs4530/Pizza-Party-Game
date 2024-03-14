import mongoose from 'mongoose';

const toppingSchema = new mongoose.Schema(
  {
    _id: String,
    pizzaId: String,
    kind: String,
  },
  { collection: 'Topping' },
);
export default toppingSchema;
