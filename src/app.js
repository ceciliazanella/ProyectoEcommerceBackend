import express from "express";
import { config as configHandlebars } from "./config/handlebars.config.js";
import { config as configWebsocket } from "./config/websocket.config.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import homeViewRouter from "./routes/home.view.router.js";
import paths from "./utils/paths.js";
import sessionsRouter from "./routes/sessions.router.js";
import { connectDB } from "./config/mongoose.config.js";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

connectDB();

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "claveDeSesionPorDefecto",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 100,
    }),
  })
);

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

configHandlebars(app);

app.use("/api/public", express.static("src/public"));
app.use("/images", express.static(paths.images));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/", homeViewRouter);

app.use("*", (req, res) => {
  res.status(404).render("error404", { title: "Error 404" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});

const httpServer = app.listen(PORT, () => {
  console.log(`Ejecutándose en http://localhost:${PORT}`);
});

configWebsocket(httpServer);
