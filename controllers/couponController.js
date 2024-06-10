import Coupon from "../models/Coupon.js";
import Cart from "../models/Cart.js";

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      res.status(404).json({ message: "Coupon not found" });
      return;
    }
    res.json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCouponByCode = async (req, res) => {
  const { code } = req.params;

  try {
    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCoupon = async (req, res) => {
  const couponData = req.body;

  try {
    const newCoupon = new Coupon(couponData);
    const savedCoupon = await newCoupon.save();

    res.status(201).json(savedCoupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createMultipleCoupons = async (req, res) => {
  const couponsData = req.body; // Array of coupon objects

  try {
    const createdCoupons = await Coupon.insertMany(couponsData);

    res.status(201).json(createdCoupons);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCoupon = async (req, res) => {
  const { id } = req.params;
  const {
    code,
    discountType,
    discountValue,
    minPurchase,
    maxDiscount,
    applicableCategories,
    newUserOnly,
    expiryDate,
  } = req.body;

  try {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      res.status(404).json({ message: "Coupon not found" });
      return;
    }

    coupon.code = code || coupon.code;
    coupon.discountType = discountType || coupon.discountType;
    coupon.discountValue = discountValue || coupon.discountValue;
    coupon.minPurchase = minPurchase || coupon.minPurchase;
    coupon.maxDiscount = maxDiscount || coupon.maxDiscount;
    coupon.applicableCategories =
      applicableCategories || coupon.applicableCategories;
    coupon.newUserOnly = newUserOnly || coupon.newUserOnly;
    coupon.expiryDate = expiryDate || coupon.expiryDate;

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      res.status(404).json({ message: "Coupon not found" });
      return;
    }

    await coupon.remove();
    res.json({ message: "Coupon removed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const validateCouponAndReturnDiscount = async (req, res) => {
  const { couponId } = req.params;
  try {
    const { cartId } = req.body;

    const coupon = await Coupon.findById(couponId);
    const cart = await Cart.findById(cartId).populate("products.product");
    const user = req.user;

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const validationResult = await validateCoupon(coupon, cart, user);

    if (!validationResult.isValid) {
      return res.status(400).json({ message: validationResult.errorMessage });
    }

    res.json({
      totalDiscount: validationResult.totalDiscount,
      totalPrice: validationResult.totalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateCoupon = async (coupon, cart, user) => {
  if (!coupon) {
    return { isValid: false, errorMessage: "Coupon not found" };
  }
  if (!cart) {
    return { isValid: false, errorMessage: "Cart not found" };
  }
  if (!user) {
    return { isValid: false, errorMessage: "User not found" };
  }
  if (coupon.expiryDate < new Date()) {
    return { isValid: false, errorMessage: "Coupon expired" };
  }
  if (coupon.newUserOnly && !user.isNewUser) {
    return { isValid: false, errorMessage: "Coupon valid only for new users" };
  }

  let totalPrice = 0;
  let applicableCategories = new Set(
    coupon.applicableCategories.map((c) => c.toString())
  );

  for (let item of cart.products) {
    const product = item.product;
    totalPrice += product.price * item.quantity;

    if (!applicableCategories.has(product.category.toString())) {
      return {
        isValid: false,
        errorMessage: `Product ${product.name} is not applicable for this coupon`,
      };
    }
  }

  let totalDiscount = 0;
  if (coupon.discountType === "percentage") {
    totalDiscount = (totalPrice * coupon.percentageAmount) / 100;
  } else if (coupon.discountType === "fixed") {
    totalDiscount =  (totalPrice * coupon.fixedAmount) / 100;
  }
  if (coupon.maxDiscount) {
    totalDiscount = Math.min(discount, coupon.maxDiscount);
  }

  if (totalPrice < coupon.minPurchase) {
    return {
      isValid: false,
      errorMessage:
        "Total purchase amount is less than minimum purchase required for the coupon",
    };
  }
  return { isValid: true, totalDiscount, totalPrice };
};

export {
  getAllCoupons,
  getCoupon,
  getCouponByCode,
  createCoupon,
  createMultipleCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  validateCouponAndReturnDiscount,
};
