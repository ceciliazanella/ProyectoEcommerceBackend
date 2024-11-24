import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import ProductManager from "./productManager.js";
import ErrorManager from "./ErrorManager.js";

const productManager = new ProductManager();

export default class CartManager {
  #jsonFilename;
  #carts;

  constructor() {
    this.#jsonFilename = "carts.json";
  }

  async #findOneById(id) {
    this.#carts = await this.getAll();
    const cartFound = this.#carts.find((item) => item.id === Number(id));
    if (!cartFound) {
      throw new ErrorManager("Este carrito no fue encontrado...", 404);
    }
    return cartFound;
  }

  async getAll() {
    try {
      this.#carts = await readJsonFile(paths.files, this.#jsonFilename);
      return this.#carts;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async getOneById(cid) {
    try {
      const cartFound = await this.#findOneById(cid);
      return cartFound;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async insertOne() {
    try {
      const cart = {
        id: generateId(await this.getAll()),
        products: [],
      };

      this.#carts.push(cart);
      await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);
      return cart;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async addProductToCart(cid, pid, quantity = 1) {
    try {
      const cartFound = await this.#findOneById(cid);
      const product = await productManager.getOneById(pid);

      pid = Number(pid);

      if (product.initialStock < quantity) {
        throw new ErrorManager(
          `No hay stock suficiente de este producto... Stock disponible: ${product.initialStock}`,
          400
        );
      }

      if (product.stock < quantity) {
        throw new ErrorManager(
          `No queda stock de este producto... Stock disponible: ${product.stock}`,
          400
        );
      }

      const productIndex = cartFound.products.findIndex(
        (item) => item.productId === pid
      );

      if (productIndex >= 0) {
        cartFound.products[productIndex].quantity += quantity;
      } else {
        cartFound.products.push({ productId: pid, quantity });
      }

      product.stock -= quantity;
      await productManager.updateOneById(pid, { stock: product.stock });

      await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);
      return cartFound;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async updateProductQuantity(cid, pid, quantity) {
    try {
      const cartFound = await this.#findOneById(cid);
      const product = await productManager.getOneById(pid);

      if (quantity <= 0) {
        throw new ErrorManager(
          "La cantidad a ingresar tiene que ser mayor que cero...",
          400
        );
      }

      if (quantity > product.initialStock) {
        throw new ErrorManager(
          `No hay suficiente stock de este producto... Stock inicial: ${product.initialStock}`,
          400
        );
      }

      const productIndex = cartFound.products.findIndex(
        (item) => item.productId === Number(pid)
      );

      if (productIndex >= 0) {
        const oldQuantity = cartFound.products[productIndex].quantity;

        const quantityDifference = quantity - oldQuantity;

        if (product.stock < quantityDifference) {
          throw new ErrorManager(
            `No hay suficiente stock para realizar esta operación... Stock restante: ${product.stock}`,
            400
          );
        }

        cartFound.products[productIndex].quantity = quantity;

        if (quantityDifference > 0) {
          product.stock -= quantityDifference;
        } else if (quantityDifference < 0) {
          product.stock += Math.abs(quantityDifference);
        }

        await productManager.updateOneById(pid, { stock: product.stock });
      } else {
        throw new ErrorManager(
          "Este producto no se encuentra en el carrito...",
          404
        );
      }

      await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);
      return cartFound;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async removeProductFromCart(cid, pid) {
    try {
      const cartFound = await this.#findOneById(cid);
      const productIndex = cartFound.products.findIndex(
        (item) => item.productId === Number(pid)
      );

      if (productIndex >= 0) {
        const quantityToReturn = cartFound.products[productIndex].quantity;

        cartFound.products.splice(productIndex, 1);

        const product = await productManager.getOneById(pid);

        if (product.stock + quantityToReturn > product.initialStock) {
          product.stock = product.initialStock;
        } else {
          product.stock += quantityToReturn;
        }

        await productManager.updateOneById(pid, { stock: product.stock });

        await writeJsonFile(paths.files, this.#jsonFilename, this.#carts);
        return cartFound;
      } else {
        throw new ErrorManager(
          "No se encontró este producto en el carrito...",
          404
        );
      }
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }
}
