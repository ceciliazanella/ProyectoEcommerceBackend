import ProductModel from "../models/product.model.js";
import ErrorManager from "../dao/db/managers/ErrorManager.js";
import { isValidID } from "../utils/validation.js";
import CartModel from "../models/cart.model.js";
import mongoose from "mongoose";

export default class CartDAO {
  static instance = null;

  constructor() {
    if (CartDAO.instance) {
      return CartDAO.instance;
    }
    CartDAO.instance = this;
  }

  async getAll() {
    try {
      const carts = await CartModel.find().populate("products.product").lean();

      if (!carts || carts.length === 0) {
        throw new ErrorManager("❌ No se encontraron Carritos...", 404);
      }

      carts.forEach((cart) => {
        cart.products.forEach((item) => {
          if (!item.product) {
            console.log(
              "❌ Este Producto no es válido en el Carrito...:",
              item
            );
          }
        });
      });
      return carts;
    } catch (error) {
      console.error(
        "❌ Hubo un Error al querer obtener los Carritos:",
        error.message
      );
      console.error(error.stack);
      throw new ErrorManager("❌ Error al querer obtener los Carritos...", 500);
    }
  }

  async findOneById(cid) {
    if (!isValidID(cid)) {
      throw new ErrorManager("❌ El ID del Carrito es inválido...", 400);
    }

    const cart = await CartModel.findById(cid).populate("products.product");
    if (!cart) {
      throw new ErrorManager("❌ Carrito no encontrado...", 404);
    }
    return cart;
  }

  async insertOne() {
    try {
      const newCart = new CartModel();

      return await newCart.save();
    } catch (error) {
      throw new ErrorManager("❌ Error al querer Crear tu Carrito...", 500);
    }
  }

  async addOneProduct(cid, pid, quantity) {
    try {
      await this.#validateProductInCart(cid, pid, quantity);

      let cart = await CartModel.findById(cid).populate("products.product");

      if (!cart) {
        cart = new CartModel();
      }

      const product = await ProductModel.findById(pid);

      if (!product) {
        throw new ErrorManager("❌ Este Producto no se pudo encontrar...", 404);
      }

      let totalQuantity = quantity;

      const stockInitial = product.stockInitial;

      const productIndex = cart.products.findIndex(
        (item) => item.product._id.toString() === pid
      );

      if (productIndex >= 0) {
        totalQuantity += cart.products[productIndex].quantity;
        if (totalQuantity > stockInitial) {
          throw new ErrorManager("❌ No hay Stock disponible...", 400);
        }

        cart.products[productIndex].quantity = totalQuantity;
      } else {
        if (totalQuantity > stockInitial) {
          throw new ErrorManager(
            "❌ No hay suficiente Stock disponible...",
            400
          );
        }

        cart.products.push({ product: pid, quantity: totalQuantity });
      }

      await cart.save();
      return cart;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async getCartProducts(cid, searchTerm = "") {
    try {
      const cart = await CartModel.findById(cid).populate("products.product");

      if (!cart || !cart.products || cart.products.length === 0) {
        return { products: [], total: 0 };
      }

      if (searchTerm) {
        cart.products = cart.products.filter((item) =>
          item.product.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      cart.products.sort((a, b) =>
        a.product.title.localeCompare(b.product.title)
      );

      const total = cart.products.reduce(
        (acc, item) => acc + (item.product.price || 0) * item.quantity,
        0
      );

      return { products: cart.products, total };
    } catch (error) {
      throw new ErrorManager(
        "❌ Hubo un Error al querer obtener los Productos de tu Carrito...",
        500
      );
    }
  }

  async updateProductQuantity(cid, pid, quantity) {
    try {
      const cart = await CartModel.findById(cid).populate("products.product");

      if (!cart) {
        throw new ErrorManager("❌ Carrito no encontrado...", 404);
      }

      const cartItem = cart.products.find(
        (item) => item.product._id.toString() === pid
      );
      if (!cartItem) {
        throw new ErrorManager(
          "❌ Este Producto no se encuentra en tu Carrito...",
          404
        );
      }

      const product = cartItem.product;

      if (quantity <= 0) {
        throw new ErrorManager("❌ La Cantidad debe ser mayor a cero...", 400);
      }
      if (quantity > product.stockInitial) {
        throw new ErrorManager(
          `❌ No podés Agregar más de ${product.stockInitial} Unidades de este Producto...`,
          400
        );
      }

      cartItem.quantity = quantity;
      await cart.save();
      return cart;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async removeProduct(cid, pid) {
    try {
      const cart = await CartModel.findById(cid).populate("products.product");

      if (!cart) {
        throw new ErrorManager("❌ Carrito no encontrado...", 404);
      }

      const productIndex = cart.products.findIndex(
        (item) => item.product._id.toString() === pid
      );

      if (productIndex === -1) {
        throw new ErrorManager(
          "❌ Este Producto no se encontró en tu Carrito...",
          404
        );
      }

      const product = cart.products[productIndex];

      cart.products.splice(productIndex, 1);

      await ProductModel.findByIdAndUpdate(pid, {
        $inc: { stock: product.quantity },
      });

      await cart.save();
      return cart;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async emptyCart(cid) {
    try {
      const cart = await CartModel.findById(cid).populate("products.product");

      if (!cart || cart.products.length === 0) {
        return cart;
      }

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
        "❌ Hubo un Error al querer Vaciar tu Carrito...",
        500
      );
    }
  }

  async #validateProductInCart(cid, pid, quantity) {
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      throw new ErrorManager("❌ El ID de este Producto inválido...", 400);
    }

    const cart = await CartModel.findById(cid);

    if (!cart) {
      throw new ErrorManager("❌ Carrito no encontrado...", 404);
    }

    const product = await ProductModel.findById(pid);
    if (!product) {
      throw new ErrorManager("❌ Producto no encontrado...", 404);
    }

    const existingProduct = cart.products.find(
      (item) => item.product._id.toString() === pid
    );

    const stockInitial = product.stockInitial;

    const totalQuantity = existingProduct
      ? existingProduct.quantity + quantity
      : quantity;

    if (totalQuantity > stockInitial) {
      throw new ErrorManager("❌ No hay suficiente Stock disponible...", 400);
    }
  }

  static async createCart() {
    try {
      const cartDAO = new CartDAO();

      const newCart = new CartModel();

      await newCart.save();
      return newCart;
    } catch (error) {
      throw new ErrorManager("❌ Error al querer Crear tu Carrito...", 500);
    }
  }
}
