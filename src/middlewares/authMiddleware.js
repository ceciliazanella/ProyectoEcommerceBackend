import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    console.log("El Token recibido es:", token);

    if (!token) {
      return res.redirect("/login");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("El Token decodificado es:", decoded);

    const user = await User.findById(decoded._id).lean();

    console.log("✔️ Usuario encontrado:", user);

    if (!user) {
      return res.redirect("/login");
    }

    req.user = user;
    console.log("👤 User:", req.user);

    next();
  } catch (error) {
    console.error("❌ Hubo un Error al querer Ingresar a la Chococuenta...:", error);

    if (error.name === "TokenExpiredError") {
      res.clearCookie("jwt");
      return res.redirect("/login"); 
    }

    return res.redirect("/login");
  }
};

