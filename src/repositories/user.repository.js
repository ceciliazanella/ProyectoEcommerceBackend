import UserDAO from "../dao/user.dao.js";
import CartDAO from "../dao/carts.dao.js";
import bcrypt from "bcrypt";

class UserRepository {
  static #instance;

  constructor() {
    if (UserRepository.#instance) {
      return UserRepository.#instance;
    }
    UserRepository.#instance = this;
  }

  static async createUser(userDTO) {
    const existingUser = await UserDAO.findByEmail(userDTO.email);

    if (existingUser) {
      throw new Error("❌ Este Correo Electrónico ya está en uso...");
    }

    const newCart = await CartDAO.createCart();

    const hashedPassword = await bcrypt.hash(userDTO.password, 10);

    const role = userDTO.role || "user";

    return await UserDAO.createUser(userDTO, newCart._id, hashedPassword, role);
  }

  static async loginUser(loginDTO) {
    const user = await UserDAO.findByEmail(loginDTO.email);

    if (!user) {
      throw new Error(
        "❌ Este Usuario no se encontró en nuestra Base de Datos..."
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDTO.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("❌ Tu Contraseña es Incorrecta...");
    }
    return user;
  }

  static async getUserById(userId) {
    const user = await UserDAO.findById(userId);

    if (!user) {
      throw new Error("❌ No se encontró este Usuario...");
    }
    return user;
  }
  static async getCartByUserId(userId) {
    const user = await CartDAO.findCartByUserId(userId);

    if (!user) {
      throw new Error("❌ Usuario no encontrado...");
    }
    return user.cart;
  }

  async getUserById(id) {
    return await UserDAO.findUserById(id);
  }
}

export default UserRepository;
