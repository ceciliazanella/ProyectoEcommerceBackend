import express from "express";
import path from "path";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";

const app = express();
const PORT = 8080;

app.use("/api/public", express.static("./src/public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.get("/", (req, res) => {
  res.send(
    "Bienvenido/a a Corazón de Chocolate, Pastelería Creativa Artesanal. Utilizar /api/products para acceder a nuestros Productos! Con /api/carts hay acceso a los Carritos de Compras!"
  );
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(process.cwd(), "favicon.ico"));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
