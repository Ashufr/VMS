import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import mongoose from "mongoose";
import { validateCoupon } from "./couponController.js";

const createOrder = async (req, res) => {
  const cartId = req.user.cart;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findById(cartId)
      .populate("products.product")
      .session(session);
    if (!cart) {
      await session.abortTransaction();
      session.endSession();
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    const coupon = await Coupon.findById(cart.coupon).session(session);
    const user = req.user;

    let discount = 0;
    let totalPrice = 0;

    for (let item of cart.products) {
      totalPrice += item.product.price * item.quantity;
    }

    if (coupon) {
      const validationResult = await validateCoupon(coupon, cart, user);
      if (validationResult.isValid) {
        discount = validationResult.totalDiscount;

        coupon.usageCount++;
        await coupon.save({ session });

        cart.products = [];
        cart.coupon = null;
        await cart.save({ session });

        user.isNewUser = false;
        await user.save({ session });
      } else {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: validationResult.errorMessage });
      }
    }

    const order = new Order({
      user: user._id,
      products: cart.products,
      coupon: cart.coupon,
      discount,
      totalPrice: totalPrice - discount,
    });

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

const getOrderDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id)
      .populate("products.product")
      .populate("coupon");
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product")
      .populate("coupon");
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { createOrder, getOrderDetails, getAllOrders };
