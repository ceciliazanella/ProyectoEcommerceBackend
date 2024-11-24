import paths from "../utils/paths.js";
import {
  readJsonFile,
  writeJsonFile,
  deleteFile,
} from "../utils/fileHandler.js";
import { generateId } from "../utils/collectionHandler.js";
import { convertToBoolean } from "../utils/converter.js";
import ErrorManager from "./ErrorManager.js";

export default class ProductManager {
  #jsonFilename;
  #products;

  constructor() {
    this.#jsonFilename = "products.json";
  }

  async #findOneById(id) {
    this.#products = await this.getAll();
    const productFound = this.#products.find((item) => item.id === Number(id));

    if (!productFound) {
      throw new ErrorManager("No se encontró este producto...", 404);
    }

    return productFound;
  }

  async getAll() {
    try {
      this.#products = await readJsonFile(paths.files, this.#jsonFilename);
      return this.#products;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
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

  async getByCategory(category) {
    try {
      if (category === "Todos los Productos") {
        return await this.getAll();
      }

      if (!category) {
        throw new ErrorManager("Categoría no fue especificada...", 400);
      }

      const categoryLower = category.toLowerCase();
      const products = await this.getAll();
      const filteredProducts = products.filter(
        (product) => product.category.toLowerCase() === categoryLower
      );

      if (filteredProducts.length === 0) {
        throw new ErrorManager("No hay productos para esta categoría...", 404);
      }

      return filteredProducts;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async getCategories() {
    try {
      const products = await this.getAll();
      const categories = [
        ...new Set(products.map((product) => product.category)),
      ];
      return categories;
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async insertOne(data, file) {
    try {
      const { title, price, stock, category, description, code } = data;

      if (!title || !price || !stock || !category || !description || !code) {
        throw new ErrorManager("Faltan agregar datos obligatorios...", 400);
      }

      const product = {
        id: generateId(await this.getAll()),
        title,
        price: Number(price),
        stock: Number(stock),
        category,
        description,
        code,
        status: true,
        thumbnail: file?.filename ?? null,
        timestamp: new Date(),
      };

      this.#products.push(product);
      await writeJsonFile(paths.files, this.#jsonFilename, this.#products);

      return product;
    } catch (error) {
      if (file?.filename) await deleteFile(paths.images, file.filename);
      throw new ErrorManager(error.message, error.code);
    }
  }

  async updateOneById(id, data, file) {
    try {
      const productFound = await this.#findOneById(id);
      const newThumbnail = file?.filename ?? productFound.thumbnail;

      const updatedProduct = {
        id: productFound.id,
        title: data.title || productFound.title,
        price: data.price ? Number(data.price) : productFound.price,
        stock: data.stock ? Number(data.stock) : productFound.stock,
        category: data.category || productFound.category,
        status:
          data.status !== undefined
            ? convertToBoolean(data.status)
            : productFound.status,
        thumbnail: newThumbnail,
        description: data.description || productFound.description,
        code: data.code || productFound.code,
        timestamp: productFound.timestamp,
      };

      const index = this.#products.findIndex((item) => item.id === Number(id));
      if (index !== -1) {
        this.#products[index] = updatedProduct;
        await writeJsonFile(paths.files, this.#jsonFilename, this.#products);
        return updatedProduct;
      } else {
        throw new ErrorManager("Este producto no fue encontrado...", 404);
      }
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }

  async deleteOneById(id) {
    try {
      const productFound = await this.#findOneById(id);

      if (productFound.thumbnail) {
        await deleteFile(paths.images, productFound.thumbnail);
      }

      const index = this.#products.findIndex((item) => item.id === Number(id));
      this.#products.splice(index, 1);
      await writeJsonFile(paths.files, this.#jsonFilename, this.#products);

      return {
        status: "success",
        message: "Este producto se eliminó exitosamente!",
      };
    } catch (error) {
      throw new ErrorManager(error.message, error.code);
    }
  }
}
