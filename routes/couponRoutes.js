import express from "express";
import {
    getAllCoupons,
    getCoupon,
    getCouponByCode,
    createCoupon,
    createMultipleCoupons,
    updateCoupon,
    deleteCoupon,
    validateCouponAndReturnDiscount,
  } from "../controllers/couponController.js";

import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllCoupons);
router.get("/:id", getCoupon);
router.get("/code/:code", getCouponByCode);
router.get("/validate/:couponId", protect, validateCouponAndReturnDiscount);
router.post("/", adminProtect, createCoupon);
router.post("/multiple", adminProtect, createMultipleCoupons);
router.put("/:id", adminProtect, updateCoupon);
router.delete("/:id", adminProtect, deleteCoupon);

export default router;