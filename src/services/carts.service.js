import CartRepository from "../repositories/carts.repository.js";
import CartDTO from "../dto/carts.dto.js";

export default class CartService {
  #cartRepository;

  static instance;
  constructor() {
    if (CartService.instance) {
      return CartService.instance;
    }
    this.#cartRepository = new CartRepository();
    CartService.instance = this;
  }

  async getAll() {
    try {
      const carts = await this.#cartRepository.getAll();

      return carts.map((cart) => new CartDTO(cart));
    } catch (error) {
      throw new Error(
        `❌ Hubo un Error al querer obtener los Carritos: ${error.message}`
      );
    }
  }

  async findOneById(cid) {
    try {
      const cart = await this.#cartRepository.findOneById(cid);

      if (!cart) {
        throw new Error("❌ Carrito no encontrado...");
      }

      return new CartDTO(cart);
    } catch (error) {
      throw new Error(
        `❌ Hubo un Error al querer obtener el Carrito con ID ${cid}: ${error.message}`
      );
    }
  }

  async insertOne(cid) {
    try {
      const newCart = await this.#cartRepository.insertOne(cid);

      return new CartDTO(newCart);
    } catch (error) {
      throw new Error(
        `❌ Hubo un Error al querer Crear un Nuevo Carrito: ${error.message}`
      );
    }
  }

  async addOneProduct(cid, pid, quantity) {
    try {
      const cart = await this.#cartRepository.addOneProduct(cid, pid, quantity);

      return new CartDTO(cart);
    } catch (error) {
      throw new Error(
        `❌ Hubo un Error al querer Agregar este Producto al Carrito con ID ${cid}: ${error.message}`
      );
    }
  }

  async getCartProducts(cid, searchTerm = "") {
    try {
      return await this.#cartRepository.getCartProducts(cid, searchTerm);
    } catch (error) {
      throw new Error(
        `❌ Hubo un Error al querer Obtener los Productos del Carrito con ID ${cid}: ${error.message}`
      );
    }
  }

  async updateProductQuantity(cid, pid, quantity) {
    try {
      const cart = await this.#cartRepository.updateProductQuantity(
        cid,
        pid,
        quantity
      );

      return new CartDTO(cart);
    } catch (error) {
      throw new Error(
        `❌ Hubo un Error al querer Actualizar la Cantidad del Producto con ID ${pid} en el Carrito con ID ${cid}: ${error.message}`
      );
    }
  }

  async removeProduct(cid, pid) {
    try {
      const cart = await this.#cartRepository.removeProduct(cid, pid);

      return new CartDTO(cart);
    } catch (error) {
      throw new Error(
        `❌ Hubo un Error al querer Eliminar el Producto con ID ${pid} del Carrito con ID ${cid}: ${error.message}`
      );
    }
  }

  async emptyCart(cid) {
    try {
      return await this.#cartRepository.emptyCart(cid);
    } catch (error) {
      throw new Error(
        `❌ Hubo un Error al querer Vaciar el Carrito con ID ${cid}: ${error.message}`
      );
    }
  }
}
