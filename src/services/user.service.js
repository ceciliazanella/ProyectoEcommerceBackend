import UserRepository from "../repositories/user.repository.js";
import UserDTO from "../dto/user.dto.js";
import CartDTO from "../dto/carts.dto.js";
import CurrentUserDTO from "../dto/current.user.dto.js";
import jwt from "jsonwebtoken";

class UserService {
  static #instance;
  constructor() {
    if (UserService.#instance) {
      return UserService.#instance;
    }
    UserService.#instance = this;
  }

  static async registerUser(requestBody) {
    const userDTO = UserDTO.fromRequestBody(requestBody);

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(userDTO.password)) {
      throw new Error(
        "❌ Tu Contraseña tiene que tener al menos 6 Carácteres, incluída una Mayúscula y un Número."
      );
    }

    const newUser = await UserRepository.createUser(userDTO);

    return { cartId: newUser.cart._id.toString(), role: newUser.role };
  }

  static async loginUser(requestBody) {
    const loginDTO = UserDTO.fromRequestBody(requestBody);

    const user = await UserRepository.loginUser(loginDTO);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return { token, cartId: user.cart._id.toString() };
  }

  static async loginUser(requestBody) {
    const loginDTO = UserDTO.fromRequestBody(requestBody);

    const user = await UserRepository.loginUser(loginDTO);
    if (!user) {
      throw new Error(
        "❌ Este Usuario no se encontró o sus Datos son incorrectos..."
      );
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return { token, cartId: user.cart._id.toString(), role: user.role };
  }

  static async getCurrentUser(userId) {
    const user = await UserRepository.getUserById(userId);

    return CurrentUserDTO.fromUser(user);
  }

  static async getCartForUser(userId) {
    const cart = await CartRepository.getCartByUserId(userId);

    return CartDTO.fromCart(cart);
  }

  static async logoutUser() {
    return { message: "✔️ Se Cerró con Éxito tu Chococuenta." };
  }
}

export default UserService;
