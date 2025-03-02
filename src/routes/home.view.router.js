import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { first_name, last_name, age, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Este Correo Electrónico ya está en uso..." });
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

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
      sameSite: "Strict",
    });

    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Hubo un Error al querer realizar el Registro..." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate("cart");
    if (!user) {
      return res.status(400).json({
        message: "Este Usuario no se encuentra en nuestra Base de Datos...",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Tu Contraseña es Incorrecta..." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000,
      sameSite: "Strict",
    });

    res.redirect("/profile");
  } catch (error) {
    console.error("Error de Inicio de Sesión...:", error);
    res
      .status(500)
      .json({ message: "Hubo un Error al querer Iniciar tu Sesión..." });
  }
});

router.get("/login", (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    return res.redirect("/profile");
  }
  res.render("login", {
    title: "Login",
  });
});

router.get("/register", (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    return res.redirect("/profile");
  }
  res.render("register", {
    title: "Registro",
  });
});

router.get("/", async (req, res) => {
  try {
    const token = req.cookies.jwt;

    let user = null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      user = await User.findById(decoded.id);

      user = user.toObject();
    }
    res.render("products", { title: "Corazón de Chocolate", user: user });
  } catch (error) {
    console.error(error);
    res.status(500).render("error", {
      errorMessage:
        "Hubo un Problema al Cargar la Página... Intentalo otra vez!",
    });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);

      const plainUser = user.toObject();

      return res.render("profile", {
        title: "Perfil",
        user: plainUser,
      });
    }
    return res.redirect("/login");
  } catch (error) {
    res.status(500).send(`<h1>Error</h1><h3>${error.message}</h3>`);
  }
});

router.get("/cart", (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.redirect("/login");
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.redirect("/login");
    }
    try {
      const user = await User.findById(decoded.id).populate("cart");

      const userObject = user.toObject();

      res.render("cart", { title: "Carrito de Compras", user: userObject });
    } catch (error) {
      console.error(
        "Error al querer Obtener el Usuario o el Carrito...:",
        error
      );
      res.status(500).render("error404", {
        title: "Error",
        errorMessage:
          "Hubo un Problema al querer Cargar el Carrito... Intentá nuevamente...",
      });
    }
  });
});

router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  res.redirect("/");
});

export default router;
