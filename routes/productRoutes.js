import express from "express";
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllProducts);
router.get("/:id", protect, getProduct);
router.post("/", adminProtect, createProduct);
router.put("/:id", adminProtect, updateProduct);
router.delete("/:id", adminProtect, deleteProduct);

export default router;
