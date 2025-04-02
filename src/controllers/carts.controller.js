import ProductModel from "../models/product.model.js";
import CartService from "../services/carts.service.js";
import TicketModel from "../models/ticket.model.js";
import CartModel from "../models/cart.model.js";
import { generateUniqueCode } from "../utils/generateCode.js";

export default class CartController {
  #cartService;

  static instance;

  constructor() {
    if (CartController.instance) {
      return CartController.instance;
    }

    this.#cartService = new CartService();
    CartController.instance = this;
  }

  async getAll(req, res) {
    try {
      const carts = await this.#cartService.getAll();

      res.status(200).json({ success: true, payload: carts });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `❌ Hubo un Error al querer obtener los Carritos...: ${error.message}`,
      });
    }
  }

  async getCartById(req, res) {
    try {
      const { cid } = req.params;

      const cart = await this.#cartService.findOneById(cid);

      res.status(200).json({ success: true, payload: cart });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `❌ Hubo un Error al querer obtener el Carrito con ID ${req.params.id}: ${error.message}`,
      });
    }
  }

  async createCart(req, res) {
    try {
      const newCart = await this.#cartService.insertOne(req.body);

      res.status(201).json({
        success: true,
        message: "✔️ Tu Carrito de Compras se Creó con Éxito! ;)",
        payload: newCart,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `❌ Hubo un Error al querer crear tu Carrito...: ${error.message}`,
      });
    }
  }

  async addProductToCart(req, res) {
    try {
      const { cid, pid } = req.params;

      const { quantity } = req.body;

      if (!quantity || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "❌ La Cantidad proporcionada es inválida...",
        });
      }

      const cart = await this.#cartService.addOneProduct(cid, pid, quantity);

      res.status(200).json({
        success: true,
        message:
          "✔️ Este Producto se Añadió con Éxito a tu Carrito de Compras! ;)",
        payload: cart,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `❌ Hubo un Error al querer Agregar este Producto a tu Carrito...: ${error.message}`,
      });
    }
  }

  async getCartProducts(req, res) {
    try {
      const { cid } = req.params;

      const { searchTerm } = req.query;

      const products = await this.#cartService.getCartProducts(cid, searchTerm);

      res.status(200).json({
        success: true,
        payload: products,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `❌ Hubo un Error al querer obtener los Productos de tu Carrito...: ${error.message}`,
      });
    }
  }

  async updateProductQuantityInCart(req, res) {
    try {
      const { cid, pid } = req.params;

      const { quantity } = req.body;

      if (!quantity || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "❌ La Cantidad proporcionada no es válida...",
        });
      }

      const cart = await this.#cartService.updateProductQuantity(
        cid,
        pid,
        quantity
      );

      res.status(200).json({
        success: true,
        message:
          "✔️ Se actualizó correctamente la Cantidad de este Producto en tu Carrito de Compras! ;)",
        payload: cart,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `❌ Hubo un Error al querer actualizar la Cantidad de este Producto en tu Carrito...: ${error.message}`,
      });
    }
  }

  async removeProductFromCart(req, res) {
    try {
      const { cid, pid } = req.params;

      const cart = await this.#cartService.removeProduct(cid, pid);

      res.status(200).json({
        success: true,
        message: "✔️ Este Producto se Eliminó de tu Carrito de Compras!",
        payload: cart,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `❌ Hubo un Error al querer Eliminar este Producto de tu Carrito...: ${error.message}`,
      });
    }
  }

  async emptyCart(req, res) {
    try {
      const { cid } = req.params;

      const cart = await this.#cartService.emptyCart(cid);

      res.status(200).json({
        success: true,
        message: "✔️ Tu Carrito se Vació correctamente!",
        payload: cart,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `❌ Hubo un Error al querer Vaciar el Carrito con ID ${cid}: ${error.message}`,
      });
    }
  }

  async finalizePurchase(req, res) {
    try {
      const { cid } = req.params;

      const cart = await this.#cartService.findOneById(cid);

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "❌ Carrito no encontrado...",
        });
      }

      let failedProducts = [];

      let purchasedProducts = [];

      let totalAmount = 0;

      for (let item of cart.products) {
        const product = await ProductModel.findById(item.product);

        if (!product) {
          failedProducts.push(
            `❌ El Producto con ID ${item.product} no pudo ser encontrado...`
          );
          continue;
        }

        if (product.stock < item.quantity) {
          failedProducts.push(product.title);
        } else {
          product.stock -= item.quantity;

          await product.save();

          purchasedProducts.push({
            productId: product._id,
            quantity: item.quantity,
            price: product.price,
          });

          totalAmount += product.price * item.quantity;
        }
      }

      if (!req.user || !req.user.email) {
        return res.status(400).json({
          success: false,
          message: "❌ Este Correo no está disponible...",
        });
      }

      const ticket = new TicketModel({
        code: generateUniqueCode(),
        amount: totalAmount,
        purchaser: req.user.email,
        products: purchasedProducts,
      });

      await ticket.save();

      await CartModel.updateOne(
        { _id: cid },
        {
          $pull: {
            products: {
              product: { $in: purchasedProducts.map((p) => p.productId) },
            },
          },
        }
      );

      res.status(200).json({
        success: true,
        message: "✔️ Realizaste tu Compra con Éxito! ;)",
        ticket,
        failedProducts,
      });
    } catch (error) {
      console.error(
        "❌ Hubo un Error al querer finalizar tu Compra...:",
        error
      );
      res.status(500).json({
        success: false,
        message: `❌ Hubo un Error al querer finalizar tu Compra...: ${error.message}`,
      });
    }
  }
}
