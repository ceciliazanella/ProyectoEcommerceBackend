import UserService from "../services/user.service.js";
import CurrentUserDTO from "../dto/current.user.dto.js";

export default class UserController {
  static #instance;

  constructor() {
    if (UserController.#instance) {
      return UserController.#instance;
    }

    UserController.#instance = this;
  }

  async register(req, res) {
    try {
      const { cartId, role } = await UserService.registerUser(req.body);

      res.status(201).json({
        message:
          "✔️ Tu Usuario fue Registrado exitosamente! Por favor, Inicia tu Chocosesión :)",
        cartId,
        role,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
          message: error.message || "❌ Mmm... hubo un Error en el Registro...",
        });
    }
  }

  async login(req, res) {
    try {
      const { token, cartId, role } = await UserService.loginUser(req.body);

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
        sameSite: "Strict",
      });

      res.status(200).json({
        message: "✔️ Entraste a tu Chococuenta con éxito! ;)",
        cartId,
        role,
        redirectTo: role === "admin" ? "/products" : "/",
      });
    } catch (error) {
      console.error(
        "❌ Hubo un Error al querer Iniciar Sesión en tu Cuenta...:",
        error.stack
      );
      res
        .status(500)
        .json({
          message:
            error.message ||
            "❌ Hubo un Error al querer Iniciar Sesión en tu Cuenta..",
        });
    }
  }

  async getCurrent(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res
          .status(401)
          .json({ message: "❌ Este Usuario no está logueado..." });
      }

      const currentUser = await UserService.getCurrentUser(req.user._id);
      if (!currentUser) {
        return res
          .status(404)
          .json({ message: "❌ No se encontró este Usuario..." });
      }

      const profileMessage =
        currentUser.role === "admin"
          ? "Bienvenido a Casa Chocoadministrador! 🍫"
          : `Hola ${currentUser.name}! Bienvenido a tu Chococuenta! 🎂`;

      res
        .status(200)
        .json({
          profile: profileMessage,
          user: CurrentUserDTO.fromUser(currentUser),
        });
    } catch (error) {
      console.error("❌ Error:", error.stack);
      res
        .status(500)
        .json({
          message:
            "❌ Hubo un Error al querer obtener la Información de este Usuario...",
        });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      return res
        .status(200)
        .json({
          success: true,
          message: "✔️ Tu Chocosesión se Cerró con Éxito!",
        });
    } catch (error) {
      console.error("❌ Error al querer Cerrar Sesión...:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "❌ Hubo un Error al querer Cerrar tu Chocosesión...",
        });
    }
  }
}
