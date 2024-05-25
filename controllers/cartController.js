import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";

const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find().populate("products.product");
    res.json(carts);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const getCart = async (req, res) => {
  const { id } = req.params;
  try {
    const cart = await Cart.findById(id).populate("products.product");
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createCart = async (user) => {
  const cart = new Cart({
    user,
    products: [],
    coupon: null,
  });

  try {
    const savedCart = await cart.save();
    res.status(201).json(savedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addProductToCart = async (req, res) => {
  const { id } = req.params;
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findById(id);
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const existingProductIndex = cart.products.findIndex(
      (p) => p.product.toString() === productId
    );
    if (existingProductIndex >= 0) {
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    const updatedCart = await cart.save();
    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const applyCouponToCart = async (req, res) => {
  const { id } = req.params;
  const { couponCode } = req.body;

  try {
    const cart = await Cart.findById(id).populate("products.product");
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const coupon = await Coupon.findOne({ code: couponCode });
    const user = req.user;

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    const validationResult = await validateCoupon(coupon, cart, user);

    if (!validationResult.isValid) {
      return res.status(400).json({ message: validationResult.errorMessage });
    }

    cart.coupon = coupon._id;
    await cart.save();

    res.json({
      totalDiscount: validationResult.totalDiscount,
      totalPrice: validationResult.totalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeCouponFromCart = (req, res) => {
  const { id } = req.params;
  try {
    const cart = Cart.findById(id);
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    cart.coupon = null;
    const updatedCart = cart.save();
    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeProductFromCart = async (req, res) => {
  const { id } = req.params;
  const { productId } = req.body;

  try {
    const cart = await Cart.findById(id);
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    cart.products = cart.products.filter(
      (p) => p.product.toString() !== productId
    );

    const updatedCart = await cart.save();
    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCart = async (req, res) => {
  const { id } = req.params;

  try {
    const cart = await Cart.findById(id);
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    await cart.remove();
    res.json({ message: "Cart removed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export {
  getAllCarts,
  getCart,
  createCart,
  addProductToCart,
  applyCouponToCart,
  removeCouponFromCart,
  removeProductFromCart,
  deleteCart,
};
