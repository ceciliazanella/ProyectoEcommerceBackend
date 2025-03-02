import { Router } from "express";
import CartManager from "../managers/CartManager.js";

const router = Router();

const cartManager = new CartManager();

router.get("/", async (req, res) => {
  try {
    const carts = await cartManager.getAll();

    console.log("Carritos Disponibles: ", carts);
    res.status(200).json({ status: "success", payload: carts });
  } catch (error) {
    console.error("Error al querer Obtener todos los Carritos...:", error);
    res
      .status(error.code || 500)
      .json({ status: "error", message: error.message });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartManager.getOneById(req.params.cid);
    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "No se encontró un Carrito espécifico...",
      });
    }
    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ status: "error", message: error.message });
  }
});

router.get("/:cid/products", async (req, res) => {
  try {
    const cartId = req.params.cid;

    const searchTerm = req.query.search ? req.query.search.toLowerCase() : "";

    const cart = await cartManager.getCartProducts(cartId, searchTerm);

    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ status: "error", message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const cart = await cartManager.insertOne();

    res.status(201).json({ status: "success", payload: cart });
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ status: "error", message: error.message });
  }
});

router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const quantity = req.body.quantity || 1;
    if (quantity <= 0) {
      return res.status(400).json({
        status: "error",
        message: "La Cantidad debe ser mayor que 0...",
      });
    }

    const cart = await cartManager.addOneProduct(cid, pid, quantity);

    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ status: "error", message: error.message });
  }
});

router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const { quantity } = req.body;
    if (quantity <= 0) {
      return res.status(400).json({
        status: "error",
        message: "La Cantidad debe ser mayor que 0...",
      });
    }

    const cart = await cartManager.updateProductQuantity(cid, pid, quantity);

    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ status: "error", message: error.message });
  }
});

router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await cartManager.emptyCart(cid);

    res.status(200).json({
      status: "success",
      message: "Carrito Vaciado con Éxito.",
      payload: cart,
    });
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ status: "error", message: error.message });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await cartManager.removeProduct(cid, pid);

    res.status(200).json({ status: "success", payload: cart });
  } catch (error) {
    res
      .status(error.code || 500)
      .json({ status: "error", message: error.message });
  }
});

export default router;
