import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authorization } from "../middlewares/authorization.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const token = req.cookies.jwt;

    let user = null;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      user = await User.findById(decoded._id).lean();
    }

    const products = await Product.find().lean();

    res.render("realTimeProducts", {
      title: "Corazón de Chocolate",
      user,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      errorMessage:
        "❌ Hubo un Problema al querer Cargar la Página... Intentalo otra vez!",
    });
  }
});

router.get(
  "/products",
  authMiddleware,
  authorization("admin"),
  async (req, res) => {
    try {
      const products = await Product.find().lean();

      res.render("products", {
        title: "Corazón de Chocolate",
        user: req.user,
        products,
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error", {
        errorMessage:
          "❌ Hubo un Problema al querer cargar la Página. Intentalo otra vez!",
      });
    }
  }
);

router.post("/register", async (req, res) => {
  const { first_name, last_name, age, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "❌ Este Correo Electrónico ya está en uso..." });
    }

    const newCart = new Cart({ products: [] });

    await newCart.save();

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      first_name,
      last_name,
      age,
      email,
      password: hashedPassword,
      cart: newCart._id,
    });

    await newUser.save();

    res.status(201).json({
      message: "✔️ Te Registraste con Éxito! Redirigiéndote a Iniciar Sesión --->",

      cartId: newCart._id.toString(),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "❌ Hubo un Error al querer realizar el Registro..." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate("cart");

    if (!user) {
      return res.status(400).json({
        message: "❌ Este Usuario no se encuentra en nuestra Base de Datos...",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "❌ Tu Contraseña es Incorrecta..." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
      sameSite: "Strict",
    });

    const responsePayload = {
      role: user.role,
      cartId: user.cart ? user.cart._id.toString() : null,
    };

    if (user.role === "admin") {
      return res.status(200).json({
        message:
          "✔️ Iniciaste tu Chocoadmin Exitosamente! Redirigiéndote a Productos --->",
        redirectTo: "/products",
        data: responsePayload,
      });
    } else {
      return res.status(200).json({
        message:
          "✔️ Iniciaste tu Chocosesión Exitosamente! Redirigiéndote a Home --->",
        redirectTo: "/",
        data: responsePayload,
      });
    }
  } catch (error) {
    console.error("❌ Error de Inicio de Sesión...:", error);
    res
      .status(500)
      .json({ message: "❌ Hubo un Error al querer Iniciar tu Sesión..." });
  }
});

router.get("/login", (req, res) => {
  const token = req.cookies.jwt;

  if (token) {
    return res.redirect("/profile");
  }
  res.render("login", {
    title: "Iniciá Sesión 🍩",
  });
});

router.get("/register", (req, res) => {
  const token = req.cookies.jwt;

  if (token) {
    return res.redirect("/profile");
  }
  res.render("register", {
    title: "Creá tu Chococuenta 🍪",
  });
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    const profileMessage =
      user.role === "admin"
        ? "Bienvenido Chocoadministrador! 🛠️"
        : `Hola, ${user.first_name}! Bienvenido a tu Chococuenta! 🥧`;
    return res.render("profile", {
      title: "Perfil",
      user,
      profileMessage,
    });
  } catch (error) {
    res.status(500).send(`<h1>Error</h1><h3>${error.message}</h3>`);
  }
});

router.get("/cart", authMiddleware, authorization("user"), async (req, res) => {
  try {
    if (!req.cookies.jwt) {
      return res.redirect("/login");
    }
    await authMiddleware(req, res, async () => {
      const user = await User.findById(req.user._id).populate("cart");

      if (!user) {
        return res.redirect("/login");
      }
      res.render("cart", {
        title: "Carrito de Compras",
        user: user.toObject(),
      });
    });
  } catch (error) {
    console.error("❌ Hubo un Error al querer obtener el Carrito:", error);
    res.status(500).render("error", {
      errorMessage:
        "❌ Hubo un Problema al querer cargar el Carrito. Intentalo otra vez!",
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

export default router;
