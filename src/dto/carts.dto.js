export default class CartDTO {
  constructor(cart) {
    this.id = cart._id;
    this.products = cart.products.map((products) => ({
      product: products.product,
      quantity: products.quantity,
      price: products.price,
    }));
    this.total = cart.total;
  }
}
