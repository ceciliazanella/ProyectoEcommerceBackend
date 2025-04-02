import ProductDAO from "../dao/products.dao.js";

export default class ProductRepository {
  static instance;

  constructor() {
    if (!ProductRepository.instance) {
      ProductRepository.instance = this;
      this.productDAO = new ProductDAO();
    }
    return ProductRepository.instance;
  }

  async getAll(filters, paginationOptions) {
    return await this.productDAO.getAll(filters, paginationOptions);
  }

  async getById(id) {
    return await this.productDAO.getById(id);
  }

  async insert(productData) {
    return await this.productDAO.insert(productData);
  }

  async updateById(id, productData) {
    return await this.productDAO.updateById(id, productData);
  }

  async deleteById(id) {
    return await this.productDAO.deleteById(id);
  }

  async checkCodeExists(code) {
    return await this.productDAO.checkCodeExists(code);
  }

  async getCategories() {
    return await this.productDAO.getCategories();
  }
}
