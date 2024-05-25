import express from "express";
import {
  getAllProducts,
  getProduct,
  createProduct,
  createMultipleProducts,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProduct);
router.post("/", adminProtect, createProduct);
router.post("/multiple", adminProtect, createMultipleProducts);
router.put("/:id", adminProtect, updateProduct);
router.delete("/:id", adminProtect, deleteProduct);

export default router;
