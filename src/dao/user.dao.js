import User from "../models/user.model.js";

class UserDAO {
  static #instance;

  constructor() {
    if (UserDAO.#instance) {
      return UserDAO.#instance;
    }
    UserDAO.#instance = this;
  }

  static async findByEmail(email) {
    return await User.findOne({ email }).populate("cart");
  }

  static async createUser(userDTO, cartId, hashedPassword, role = "user") {
    const newUser = new User({
      first_name: userDTO.first_name,
      last_name: userDTO.last_name,
      age: userDTO.age,
      email: userDTO.email,
      password: hashedPassword,
      cart: cartId,
      role: role,
    });
    return await newUser.save();
  }

  static async findById(userId) {
    return await User.findById(userId).populate("cart");
  }

  static async findCartByUserId(userId) {
    return await User.findById(userId).populate("cart");
  }

  async findUserById(id) {
    return await User.findById(id);
  }
}

export default UserDAO;
