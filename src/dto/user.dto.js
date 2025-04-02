class UserDTO {
  constructor(first_name, last_name, age, email, password, cartId, products) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.age = age;
    this.email = email;
    this.password = password;
    this.cartId = cartId;
    this.products = products;
  }

  static fromRequestBody(body) {
    return new UserDTO(
      body.first_name,
      body.last_name,
      body.age,
      body.email,
      body.password,
      body.cartId,
      body.products
    );
  }
}

export default UserDTO;
