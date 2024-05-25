import express from "express";
import {
    getAllCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/categoryController.js";

import { protect, adminProtect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", getCategory);
router.post("/",adminProtect, createCategory);
router.put("/:id",adminProtect, updateCategory);
router.delete("/:id",adminProtect, deleteCategory);

export default router;