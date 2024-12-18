import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  try {
    res.render("products", { title: "Home" });
  } catch (error) {
    res.status(500).send(`<h1>Error</h1><h3>${error.message}</h3>`);
  }
});

router.get("/cart", async (req, res) => {
  try {
    res.render("cart", { title: "Carrito de Compras" });
  } catch (error) {
    res.status(500).send(`<h1>Error</h1><h3>${error.message}</h3>`);
  }
});

export default router;
