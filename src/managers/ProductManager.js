import paths from "../utils/paths.js";
import { readJsonFile, writeJsonFile } from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import ErrorManager from "./ErrorManager.js";

export default class ProductManager {
  #jsonFilename;
  #products;

  constructor() {
    this.#jsonFilename = "products.json";
  }

  async #findOneById(id) {
    this.#products = await this.getAll();

    if (!this.#products) {
      throw new ErrorManager("No se pudo cargar el archivo con los productos.", 500);
    }

    const productFound = this.#products.find((item) => item.id === Number(id));

    if (!productFound) {
      throw new ErrorManager("Producto no encontrado...", 404);
    }
    return productFound;
  }

  async getAll() {
    try {
      this.#products = await readJsonFile(paths.files, this.#jsonFilename);

      if (!Array.isArray(this.#products)) {
        throw new ErrorManager("El archivo de los productos está vacío...", 500);
      }

      return this.#products;
    } catch (error) {
      throw new ErrorManager(error.message, error.code || 500);
    }
  }

  async getOneById(id) {
    try {
      const productFound = await this.#findOneById(id);
      return productFound;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async updateOneById(id, data) {
    try {
      const productFound = await this.#findOneById(id);
      const index = this.#products.findIndex((item) => item.id === Number(id));

      if (index === -1) {
        throw new ErrorManager("No se pudo encontrar este producto.", 404);
      }

      this.#products[index] = { ...productFound, ...data };

      await writeJsonFile(paths.files, this.#jsonFilename, this.#products);

      return this.#products[index];
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async deleteOneById(id) {
    try {
      this.#products = await this.getAll();

      if (!Array.isArray(this.#products) || this.#products.length === 0) {
        throw new ErrorManager(
          "No hay productos disponibles para eliminar.",
          400
        );
      }

      const index = this.#products.findIndex((item) => item.id === Number(id));

      if (index === -1) {
        throw new ErrorManager("Producto no encontrado.", 404);
      }

      this.#products.splice(index, 1);

      await writeJsonFile(paths.files, this.#jsonFilename, this.#products);

      return {
        status: "success",
        message: "Este producto fue eliminado con éxito.",
      };
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async insertOne(data) {
    try {
      const product = {
        id: generateId(await this.getAll()),
        title: data.title,
        description: data.description,
        price: data.price,
        stock: data.stock,
        code: data.code,
        status: data.status,
        category: data.category,
        thumbnails: data.thumbnails,
        timestamp: new Date(),
      };

      this.#products.push(product);

      await writeJsonFile(paths.files, this.#jsonFilename, this.#products);

      return product;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }
}
