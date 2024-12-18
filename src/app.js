import express from "express";
import { config as configHandlebars } from "./config/handlebars.config.js";
import { config as configWebsocket } from "./config/websocket.config.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import homeViewRouter from "./routes/home.view.router.js";
import { connectDB } from "./config/mongoose.config.js";

const app = express();

const PORT = 8080;

connectDB();

app.use("/api/public", express.static("./src/public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

configHandlebars(app);

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", homeViewRouter);

app.use("*", (req, res) => {
  res.status(404).render("error404", { title: "Error 404" });
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(process.cwd(), "favicon.ico"));
});

const httpServer = app.listen(PORT, () => {
  console.log(`Ejecutándose en http://localhost:${PORT}`);
});

configWebsocket(httpServer);
