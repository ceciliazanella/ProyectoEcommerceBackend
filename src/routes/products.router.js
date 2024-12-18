import { Router } from "express";
import uploader from "../config/multer.config.js";
import ProductManager from "../managers/ProductManager.js";

const router = Router();

const productManager = new ProductManager();

router.get("/", async (req, res) => {
  try {
    const stock = req.query.stock !== undefined ? req.query.stock : "all";

    if (stock !== "1" && stock !== "all") {
      return res.status(400).json({
        status: "error",
        message:
          'El Valor del Stock debe ser "1" para Productos Disponibles o "all" para todos los Productos...',
      });
    }

    const products = await productManager.getAll(req.query);

    res.status(200).json({ status: "success", payload: products });
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ status: "error", message: error.message });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const categories = await productManager.getCategories();

    res.status(200).json({ status: "success", categories });
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ status: "error", message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await productManager.getOneById(req.params.id);

    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ status: "error", message: error.message });
  }
});

router.post("/", uploader.single("thumbnails"), async (req, res) => {
  try {
    const productData = req.body;

    const imageFile = req.file;

    const product = await productManager.insertOne(productData, imageFile);

    res.status(201).json({ status: "success", product });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ status: "error", message: error.message });
  }
});

router.put("/:id", uploader.single("thumbnails"), async (req, res) => {
  try {
    const productData = req.body;

    const imageFile = req.file;

    const product = await productManager.updateOneById(
      req.params.id,
      productData,
      imageFile
    );
    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ status: "error", message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await productManager.deleteOneById(req.params.id);

    res.status(200).json({ status: "success", payload: product });
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ status: "error", message: error.message });
  }
});

export default router;
