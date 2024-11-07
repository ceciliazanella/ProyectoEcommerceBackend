import { Router } from "express";
import ProductManager from "../managers/productManager.js";

const router = Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {
  try {
    const category = req.query.category;

    let products = await productManager.getAll();

    if (category) {
      const categoryLower = category.trim().toLowerCase();

      products = products.filter(
        (product) =>
          product.category && product.category.toLowerCase() === categoryLower
      );
    }

    if (products.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron productos para esta categoría..." });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const product = await productManager.getOneById(req.params.pid);
    res.status(200).json(product);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newProduct = req.body;
    const product = await productManager.insertOne(newProduct);
    res.status(201).json(product);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const updatedData = req.body;
    const product = await productManager.updateOneById(
      req.params.pid,
      updatedData
    );
    res.status(200).json(product);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const result = await productManager.deleteOneById(req.params.pid);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

export default router;
