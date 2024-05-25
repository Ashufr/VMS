import express from "express";
import {
  getAllCarts,
  getCart,
  addProductToCart,
  applyCouponToCart,
  removeCouponFromCart,
  removeProductFromCart,
  deleteCart,
} from "../controllers/cartController.js";

import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/all", adminProtect, getAllCarts);
router.get("/", protect, getCart);
router.post("/add-product", protect, addProductToCart);
router.post("/apply-coupon", protect, applyCouponToCart);
router.post("/remove-coupon", protect, removeCouponFromCart);
router.post("/remove-product", protect, removeProductFromCart);
router.delete("/:id", adminProtect, deleteCart);

export default router;