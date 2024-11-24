import express from "express";
import ProductManager from "../managers/ProductManager.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "public", "images"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const router = express.Router();
const productManager = new ProductManager();

router.get("/", async (req, res) => {
  try {
    const products = await productManager.getAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await productManager.getOneById(req.params.id);
    res.status(200).json(product);
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

router.get("/category/:category", async (req, res) => {
  try {
    const products = await productManager.getByCategory(req.params.category);
    res.status(200).json(products);
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

router.post("/", upload.single("thumbnail"), async (req, res) => {
  try {
    const newProduct = await productManager.insertOne(req.body, req.file);
    res.status(201).json(newProduct);
  } catch (error) {
    if (req.file) {
      await deleteFile(
        path.join(process.cwd(), "public", "images"),
        req.file.filename
      );
    }
    res.status(error.code || 500).json({ message: error.message });
  }
});

router.put("/:id", upload.single("thumbnail"), async (req, res) => {
  try {
    const updatedProduct = await productManager.updateOneById(
      req.params.id,
      req.body,
      req.file
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    if (req.file) {
      await deleteFile(
        path.join(process.cwd(), "public", "images"),
        req.file.filename
      );
    }
    res.status(error.code || 500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await productManager.deleteOneById(req.params.id);
    res.status(200).json({ message: "Eliminaste éxitosamente este producto!" });
  } catch (error) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

export default router;
