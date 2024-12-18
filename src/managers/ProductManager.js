import ErrorManager from "./ErrorManager.js";
import { isValidID } from "../config/mongoose.config.js";
import ProductModel from "../models/product.model.js";
import path from "path";

export default class ProductManager {
  #productModel;

  constructor() {
    this.#productModel = ProductModel;
  }

  async #findOneById(id) {
    if (!isValidID(id)) {
      throw new ErrorManager("ID inválido", 400);
    }

    const product = await this.#productModel.findById(id);
    if (!product) {
      throw new ErrorManager("No se encontró el ID...", 404);
    }
    return product;
  }

  async getAll(params) {
    try {
      const $and = [];

      if (params?.title) {
        $and.push({ title: { $regex: params.title, $options: "i" } });
      }
      if (params?.category && params.category !== "Todas las Categorías") {
        $and.push({ category: params.category });
      }
      if (params?.stock === "1") {
        $and.push({ stock: { $gte: 1 } });
      }

      const filters = $and.length > 0 ? { $and } : {};

      const sort = {};
      if (params?.sort === "price_asc") {
        sort.price = 1;
      } else if (params?.sort === "price_desc") {
        sort.price = -1;
      }

      const paginationOptions = {
        limit: 3,
        page: parseInt(params?.page) || 1,
        sort: sort,
        lean: true,
      };

      const products = await this.#productModel.paginate(
        filters,
        paginationOptions
      );

      if (params?.category === "Todas las Categorías") {
        const categories = await this.#productModel.distinct("category");
        return {
          products: products.docs,
          categories,
        };
      }
      return products;
    } catch (error) {
      throw new ErrorManager(error.message, 500);
    }
  }

  async getCategories() {
    const categories = await this.#productModel.aggregate([
      { $match: { category: { $exists: true, $ne: null, $ne: "" } } },
      { $group: { _id: "$category" } },
    ]);
    return categories.map((item) => item._id);
  }

  async getOneById(id) {
    return await this.#findOneById(id);
  }

  async checkCodeExists(code) {
    const existingProduct = await this.#productModel.findOne({ code });
    return existingProduct !== null;
  }

  async insertOne(productData, imageFile) {
    if (await this.checkCodeExists(productData.code)) {
      throw new ErrorManager(
        "Este Código ya está en uso! Ingresá uno nuevo, por favor...",
        400
      );
    }
    if (imageFile) {
      productData.thumbnails = path.join(
        "uploads",
        "products",
        imageFile.filename
      );
    }

    const product = new this.#productModel(productData);

    await product.save();
    return product;
  }

  async updateOneById(id, productData, imageFile) {
    const product = await this.#findOneById(id);
    if (productData.code && productData.code !== product.code) {
      if (await this.checkCodeExists(productData.code)) {
        throw new ErrorManager(
          "Este Código ya está en uso! Ingresá uno nuevo, por favor!",
          400
        );
      }
    }
    if (imageFile) {
      productData.thumbnails = path.join(
        "uploads",
        "products",
        imageFile.filename
      );
    }
    Object.assign(product, productData);
    await product.save();
    return product;
  }

  async deleteOneById(id) {
    const product = await this.#findOneById(id);
    if (!product) {
      throw new ErrorManager("Producto no encontrado", 404);
    }
    await product.constructor.deleteOne({ _id: id });
    return product;
  }
}
