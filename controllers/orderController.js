import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import mongoose from "mongoose";
import { validateCoupon } from "./couponController.js";

const createOrder = async (req, res) => {
  const cartId = req.user.cart;

  try {
    const cart = await Cart.findById(cartId)
      .populate("products.product")
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    const coupon = await Coupon.findById(cart.coupon);
    const user = req.user;

    let discount = 0;
    let totalPrice = 0;

    if (cart.products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    for (let item of cart.products) {
      totalPrice += item.product.price * item.quantity;
    }

    if (coupon) {
      const validationResult = await validateCoupon(coupon, cart, user);
      if (validationResult.isValid) {
        discount = validationResult.totalDiscount;

      } else {
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

    await order.save();
    
    cart.coupon = null;
    cart.products = [];
    cart.products
    await cart.save();
   
    user.isNewUser = false;
    await user.save();

    res.status(201).json(order);
  } catch (error) {
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
    if(order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("products.product")
      .populate("coupon");
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllUserOrders = async (req, res) => {
  const userId  = req.user._id;
  try {
    const orders = await Order.find({ user: userId })
      .populate("products.product")
      .populate("coupon");
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export { createOrder, getOrderDetails, getAllOrders, getAllUserOrders };
