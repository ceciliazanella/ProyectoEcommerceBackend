import { Router } from "express";
import ProductManager from "../managers/productManager.js";

const router = Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {
  try {
    const products = await productManager.getAll();

    if (products.length === 0) {
      return res.status(404).json({
        error: "No se encontraron productos.",
      });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const categoryLower = category.toLowerCase();

    const products = await productManager.getAll();

    const filteredProducts = products.filter((product) => {
      return (
        product.category && product.category.toLowerCase() === categoryLower
      );
    });

    if (filteredProducts.length === 0) {
      return res.status(404).json({
        error: "No se encontraron productos en esta categoría...",
      });
    }

    res.status(200).json(filteredProducts);
  } catch (error) {
    console.error(error);
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    if (isNaN(pid)) {
      return res.status(400).json({
        error:
          "El parámetro 'pid' debe ser un número válido (ID del producto).",
      });
    }

    const product = await productManager.getOneById(pid);
    res.status(200).json(product);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newProduct = req.body;

    if (
      !newProduct.title ||
      !newProduct.description ||
      !newProduct.price ||
      !newProduct.category
    ) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios excepto thumbnails.",
      });
    }

    const product = await productManager.insertOne(newProduct);
    res.status(201).json(product);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    if (isNaN(pid)) {
      return res.status(400).json({
        error:
          "El parámetro 'pid' debe ser un número válido (ID del producto).",
      });
    }

    const updatedData = req.body;
    const product = await productManager.updateOneById(pid, updatedData);
    res.status(200).json(product);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    if (isNaN(pid)) {
      return res.status(400).json({
        error:
          "El parámetro 'pid' debe ser un número válido (ID del producto).",
      });
    }

    const result = await productManager.deleteOneById(pid);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

export default router;
