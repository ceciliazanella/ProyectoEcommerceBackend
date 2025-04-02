import { Router } from "express";
import ProductController from "../controllers/products.controller.js";
import uploader from "../config/multer.config.js";

const router = Router();
const productController = new ProductController();

router.get("/", (req, res) => productController.getAll(req, res));

router.get("/categories", (req, res) =>
  productController.getCategories(req, res)
);

router.get("/:id", (req, res) => productController.getOneById(req, res));

router.post("/", uploader.single("thumbnails"), (req, res) =>
  productController.insert(req, res)
);

router.put("/:id", uploader.single("thumbnails"), (req, res) =>
  productController.updateById(req, res)
);

router.delete("/:id", (req, res) => productController.deleteById(req, res));

export default router;
