import ErrorManager from "./ErrorManager.js";
import { isValidID } from "../config/mongoose.config.js";
import CartModel from "../models/cart.model.js";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";

export default class CartManager {
  #cartModel;

  constructor() {
    this.#cartModel = CartModel;
  }

  async #findOneById(id) {
    if (!isValidID(id)) {
      throw new ErrorManager("El ID del Carrito es inválido...", 400);
    }
    const cart = await this.#cartModel
      .findById(id)
      .populate("products.product");
    if (!cart) {
      throw new ErrorManager("Mmm... Carrito no encontrado...", 404);
    }
    return cart;
  }

  async getAll() {
    try {
      return await this.#cartModel.find().populate("products.product").lean();
    } catch (error) {
      throw new ErrorManager("Error al querer obtener los Carritos...", 500);
    }
  }

  async getOneById(id) {
    try {
      return await this.#findOneById(id);
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async insertOne() {
    try {
      const newCart = new this.#cartModel();
      return await newCart.save();
    } catch (error) {
      throw new ErrorManager("Error al querer crear un Nuevo Carrito...", 500);
    }
  }

  async addOneProduct(id, productId, quantity) {
    try {
      let cart = await this.#findOneById(id);
      if (!cart) {
        cart = await this.insertOne();
      }
      await this.#validateProductInCart(id, productId, quantity);

      const product = await ProductModel.findById(productId);

      let totalQuantity = quantity;

      const stockInitial = product.stockInitial;

      const productIndex = cart.products.findIndex(
        (item) => item.product._id.toString() === productId
      );
      if (productIndex >= 0) {
        totalQuantity += cart.products[productIndex].quantity;
        if (totalQuantity > stockInitial) {
          throw new ErrorManager("Sin Stock disponible...", 400);
        }
        cart.products[productIndex].quantity = totalQuantity;
      } else {
        if (totalQuantity > stockInitial) {
          throw new ErrorManager("No hay suficiente Stock disponible...", 400);
        }
        cart.products.push({ product: productId, quantity: totalQuantity });
      }
      await cart.save();
      return cart;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async removeProduct(id, productId) {
    try {
      const cart = await this.#findOneById(id);

      const productIndex = cart.products.findIndex(
        (item) => item.product._id.toString() === productId
      );
      if (productIndex === -1) {
        throw new ErrorManager(
          "Este Producto no se encontró en el Carrito...",
          404
        );
      }

      const product = cart.products[productIndex];

      cart.products.splice(productIndex, 1);
      await ProductModel.findByIdAndUpdate(productId, {
        $inc: { stock: product.quantity },
      });
      await cart.save();
      return cart;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async updateProductQuantity(cartId, productId, quantity) {
    try {
      const cart = await this.#findOneById(cartId);
      if (!cart) {
        throw new ErrorManager("Carrito no encontrado...", 404);
      }
      const cartItem = cart.products.find(
        (item) => item.product._id.toString() === productId
      );
      if (!cartItem) {
        throw new ErrorManager(
          "Este Producto no se encontró en el Carrito...",
          404
        );
      }

      const product = cartItem.product;

      if (quantity <= 0) {
        throw new ErrorManager(
          "La Cantidad tiene que ser mayor a cero...",
          400
        );
      }
      if (quantity > product.stockInitial) {
        throw new ErrorManager(
          `No podés agregar más de ${product.stockInitial} Unidades de este Producto!`,
          400
        );
      }
      cartItem.quantity = quantity;
      cartItem.total = product.price * quantity;
      await cart.save();
      return {
        status: "success",
        message: "La Cantidad de este Producto fue actualizada correctamente!",
        payload: cart,
      };
    } catch (error) {
      throw error;
    }
  }

  async getCartProducts(cartId, searchTerm = "") {
    try {
      const cart = await this.#findOneById(cartId).populate("products.product");
      if (!cart || !cart.products || cart.products.length === 0) {
        return { products: [], total: 0 };
      }
      if (searchTerm) {
        cart.products = cart.products.filter((item) =>
          item.product.title.toLowerCase().includes(searchTerm)
        );
      }
      cart.products.sort((a, b) =>
        a.product.title.localeCompare(b.product.title)
      );
      return {
        products: cart.products,
        total: cart.products.reduce(
          (acc, item) => acc + (item.product.price || 0) * item.quantity,
          0
        ),
      };
    } catch (error) {
      throw new ErrorManager(
        "Error al obtener los Productos del Carrito...",
        500
      );
    }
  }

  async emptyCart(cid) {
    try {
      const cart = await this.getOneById(cid);
      if (cart.products.length === 0) return cart;
      await Promise.all(
        cart.products.map(async (item) => {
          const product = await ProductModel.findById(item.product._id);
          if (product) {
            await ProductModel.findByIdAndUpdate(item.product._id, {
              $inc: { stock: item.quantity },
            });
          }
        })
      );
      cart.products = [];
      cart.total = 0;
      await cart.save();
      return cart;
    } catch (error) {
      throw new ErrorManager(
        "Hubo un Error al querer Vaciar el Carrito...: " + error.message,
        500
      );
    }
  }

  async #validateProductInCart(cartId, productId, quantity) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ErrorManager("El ID de este Producto es inválido...", 400);
    }

    const cart = await this.#findOneById(cartId);

    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new ErrorManager("Producto no encontrado...", 404);
    }

    const existingProduct = cart.products.find(
      (item) => item.product._id.toString() === productId
    );

    const stockInitial = product.stockInitial;

    const totalQuantity = existingProduct
      ? existingProduct.quantity + quantity
      : quantity;
    if (totalQuantity > stockInitial) {
      throw new ErrorManager("No hay suficiente Stock disponible...", 400);
    }
  }
}
