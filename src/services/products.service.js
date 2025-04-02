import ProductRepository from "../repositories/products.repository.js";
import ProductDTO from "../dto/products.dto.js";
import ErrorManager from "../dao/db/managers/ErrorManager.js";

export default class ProductService {
  static instance;

  constructor() {
    if (!ProductService.instance) {
      ProductService.instance = this;
      this.productRepository = new ProductRepository();
    }
    return ProductService.instance;
  }

  async getAll(params) {
    try {
      const filters = [];

      if (params?.title) {
        filters.push({ title: { $regex: params.title, $options: "i" } });
      }

      if (params?.category && params.category !== "Todas las Categorías") {
        filters.push({ category: params.category });
      }

      if (params?.stock === "1") {
        filters.push({ stock: { $gte: 1 } });
      }

      const page = isNaN(parseInt(params?.page)) ? 1 : parseInt(params.page);

      const paginationOptions = {
        limit: 3,
        page: page,
        sort: params?.sort
          ? { price: params.sort === "price_asc" ? 1 : -1 }
          : {},
        lean: true,
      };

      const products = await this.productRepository.getAll(
        { $and: filters },
        paginationOptions
      );

      const productDTOs = products.docs.map(
        (product) => new ProductDTO(product)
      );

      return {
        products: productDTOs,
        totalDocs: products.totalDocs,
        totalPages: products.totalPages,
        currentPage: products.page,
        limit: products.limit,
      };
    } catch (error) {
      throw new ErrorManager(error.message, 500);
    }
  }

  async getOneById(id) {
    const product = await this.productRepository.getById(id);

    if (!product) throw new ErrorManager("❌ Producto no encontrado...", 404);
    return new ProductDTO(product);
  }

  async insert(productData, imageFile) {
    if (await this.productRepository.checkCodeExists(productData.code)) {
      throw new ErrorManager("❌ Este Código ya existe!", 400);
    }

    if (imageFile) {
      productData.thumbnails = `uploads/products/${imageFile.filename}`;
    }

    const product = await this.productRepository.insert(productData);

    return new ProductDTO(product);
  }

  async updateById(id, productData, imageFile) {
    const existingProduct = await this.productRepository.getById(id);

    if (!existingProduct)
      throw new ErrorManager("❌ Producto no encontrado...", 404);
    if (productData.code && productData.code !== existingProduct.code) {
      if (await this.productRepository.checkCodeExists(productData.code)) {
        throw new ErrorManager("❌ Código ya existente...", 400);
      }
    }
    if (imageFile) {
      productData.thumbnails = `uploads/products/${imageFile.filename}`;
    }

    const updatedProduct = await this.productRepository.updateById(
      id,
      productData
    );

    return new ProductDTO(updatedProduct);
  }

  async deleteById(id) {
    const product = await this.productRepository.getById(id);

    if (!product) throw new ErrorManager("❌ Producto no encontrado...", 404);
    await this.productRepository.deleteById(id);
    return new ProductDTO(product);
  }

  async getCategories() {
    const categories = await this.productRepository.getCategories();

    return categories.map((item) => item._id);
  }
}
