import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { first_name, last_name, age, email, password } = req.body;

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .json({
        message:
          "Tu Contraseña tiene que tener al menos 6 Carácteres, incluída una Mayúscula y un Número.",
      });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Este Correo Electrónico ya está en uso..." });
    }

    const newCart = new Cart({
      products: [],
    });

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

    res.status(201).json({
      message:
        "Tu ChocoCuenta se creó Éxitosamente! Por favor, iniciá tu ChocoSesión...",
      cartId: newCart._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el registro" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).populate("cart");
    if (!user) {
      return res
        .status(400)
        .json({
          message: "Este Usuario no se encontró en nuestra Base de Datos...",
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
    res.status(200).json({
      message: "Iniciaste Sesión Éxitosamente!",
      cartId: user.cart._id.toString(),
    });
  } catch (error) {
    console.error("Hubo un Error al querer Iniciar Sesión...:", error);
    res
      .status(500)
      .json({ message: "Hubo un Error en el Inicio de tu Sesión..." });
  }
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = req.user;
      res.status(200).json({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        cartId: user.cart._id,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
          message:
            "Hubo un Error al querer Obtener toda la Información del Usuario Actual...",
        });
    }
  }
);

router.get(
  "/cart",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    if (!req.user) {
      return res.redirect("/login");
    }

    const user = await User.findById(req.user.id).populate("cart");
    res.status(200).json({
      cart: user.cart,
    });
  }
);

router.get("/logout", (req, res) => {
  res.clearCookie("jwt", { path: "/" });
  res.redirect("/");
});

export default router;
