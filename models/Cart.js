import mongoose from 'mongoose';

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 1
        }
      }
    ],
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    }
  },
  {
    timestamps: true
  }
);

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
