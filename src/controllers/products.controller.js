import ProductService from "../services/products.service.js";

export default class ProductController {
  static instance;

  constructor() {
    if (!ProductController.instance) {
      ProductController.instance = this;
      this.productService = new ProductService();
    }
    return ProductController.instance;
  }

  async getAll(req, res) {
    try {
      const products = await this.productService.getAll(req.query);

      res.status(200).json({ status: "success", payload: products });
    } catch (error) {
      res
        .status(error.code || 500)
        .json({ status: "error", message: error.message });
    }
  }

  async getOneById(req, res) {
    try {
      const product = await this.productService.getOneById(req.params.id);

      res.status(200).json({ status: "success", payload: product });
    } catch (error) {
      res
        .status(error.code || 500)
        .json({ status: "error", message: error.message });
    }
  }

  async insert(req, res) {
    try {
      const product = await this.productService.insert(req.body, req.file);

      res.status(201).json({ status: "success", product });
    } catch (error) {
      res
        .status(error.code || 500)
        .json({ status: "error", message: error.message });
    }
  }

  async updateById(req, res) {
    try {
      const product = await this.productService.updateById(
        req.params.id,
        req.body,
        req.file
      );

      res.status(200).json({ status: "success", payload: product });
    } catch (error) {
      res
        .status(error.code || 500)
        .json({ status: "error", message: error.message });
    }
  }

  async deleteById(req, res) {
    try {
      const product = await this.productService.deleteById(req.params.id);

      res.status(200).json({ status: "success", payload: product });
    } catch (error) {
      res
        .status(error.code || 500)
        .json({ status: "error", message: error.message });
    }
  }

  async getCategories(req, res) {
    try {
      const categories = await this.productService.getCategories();

      res.status(200).json({ status: "success", categories });
    } catch (error) {
      res
        .status(error.code || 500)
        .json({ status: "error", message: error.message });
    }
  }
}
