import express from "express";
import CartController from "../controllers/carts.controller.js";
import { authorization } from "../middlewares/authorization.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();
const cartController = new CartController();

router.get("/:cid", authMiddleware, authorization("user"), (req, res) =>
  cartController.getCartById(req, res)
);

router.get("/", authMiddleware, authorization("user"), (req, res) =>
  cartController.getAll(req, res)
);

router.post("/", (req, res) => cartController.createCart(req, res));

router.post(
  "/:cid/products/:pid",
  authMiddleware,
  authorization("user"),
  (req, res) => cartController.addProductToCart(req, res)
);

router.get(
  "/:cid/products",
  authMiddleware,
  authorization("user"),
  (req, res) => cartController.getCartProducts(req, res)
);

router.put(
  "/:cid/products/:pid",
  authMiddleware,
  authorization("user"),
  (req, res) => cartController.updateProductQuantityInCart(req, res)
);

router.delete(
  "/:cid/products/:pid",
  authMiddleware,
  authorization("user"),
  (req, res) => cartController.removeProductFromCart(req, res)
);

router.delete("/:cid", authMiddleware, authorization("user"), (req, res) =>
  cartController.emptyCart(req, res)
);

router.post("/:cid/purchase", authMiddleware, (req, res) =>
  cartController.finalizePurchase(req, res)
);

export default router;
