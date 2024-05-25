import express from "express";
import { createOrder, getOrderDetails, getAllOrders, getAllUserOrders } from "../controllers/orderController.js";

import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/:id",protect, getOrderDetails);
router.get("/", adminProtect, getAllOrders);
router.get("/user-orders", protect, getAllUserOrders);

export default router;