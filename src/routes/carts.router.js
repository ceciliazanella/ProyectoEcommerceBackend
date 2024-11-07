import { Router } from "express";
import CartManager from "../managers/cartManager.js";

const router = Router();
const cartManager = new CartManager();

router.get("/", async (req, res) => {
  try {
    const carts = await cartManager.getAll();
    res.status(200).json(carts);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getOneById(Number(cid));
    res.status(200).json(cart);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.get("/:cid/products", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getOneById(Number(cid));
    res.status(200).json(cart.products);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.get("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartManager.getOneById(Number(cid));
    const product = cart.products.find(
      (item) => item.productId === Number(pid)
    );

    if (!product) {
      return res
        .status(404)
        .json({ error: "Este producto no se encuentra en el carrito..." });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const cart = await cartManager.insertOne();
    res.status(201).json(cart);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const quantity = req.body.quantity || 1;

    const cart = await cartManager.addProductToCart(
      Number(cid),
      Number(pid),
      quantity
    );
    res.status(200).json(cart);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.put("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res
        .status(400)
        .json({
          error: "La cantidad a ingresar tiene que ser mayor que cero...",
        });
    }

    const cart = await cartManager.updateProductQuantity(
      Number(cid),
      Number(pid),
      quantity
    );
    res.status(200).json(cart);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

router.delete("/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await cartManager.removeProductFromCart(
      Number(cid),
      Number(pid)
    );
    res.status(200).json(cart);
  } catch (error) {
    res.status(error.code || 500).json({ error: error.message });
  }
});

export default router;
