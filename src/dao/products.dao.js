import ProductModel from "../models/product.model.js";

export default class ProductDAO {
  static instance;

  constructor() {
    if (!ProductDAO.instance) {
      ProductDAO.instance = this;
    }
    return ProductDAO.instance;
  }

  async getAll(filters, paginationOptions) {
    return await ProductModel.paginate(filters, paginationOptions);
  }

  async getById(id) {
    return await ProductModel.findById(id);
  }

  async insert(productData) {
    const product = new ProductModel(productData);
    return await product.save();
  }

  async updateById(id, productData) {
    return await ProductModel.findByIdAndUpdate(id, productData, {
      new: true,
    });
  }

  async deleteById(id) {
    return await ProductModel.deleteOne({ _id: id });
  }

  async checkCodeExists(code) {
    return await ProductModel.findOne({ code });
  }

  async getCategories() {
    return await ProductModel.aggregate([
      { $match: { category: { $exists: true, $ne: null, $ne: "" } } },
      { $group: { _id: "$category" } },
    ]);
  }
}
