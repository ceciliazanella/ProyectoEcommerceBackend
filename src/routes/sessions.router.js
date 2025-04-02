import express from "express";
import passport from "passport";
import UserController from "../controllers/user.controller.js";

const router = express.Router();

const userController = new UserController();

router.post("/register", (req, res) => userController.register(req, res));

router.post("/login", (req, res) => userController.login(req, res));

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => userController.getCurrent(req, res)
);

router.get("/logout", async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res
      .status(200)
      .json({
        success: true,
        message: "✔️ Se Cerró con Éxito Tu Chocosesión.",
      });
  } catch (error) {
    console.error("Error en logout:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "❌ Hubo un Error al querer Cerrar tu Chocosesión...",
      });
  }
});

export default router;
