export default class ProductDTO {
  constructor(product) {
    this._id = product._id;
    this.title = product.title;
    this.description = product.description;
    this.code = product.code;
    this.price = product.price;
    this.category = product.category;
    this.stock = product.stock;
    this.thumbnails = product.thumbnails;
  }
}
