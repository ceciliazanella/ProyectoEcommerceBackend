class CurrentUserDTO {
  constructor(first_name, last_name, email, role) {
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.role = role;
  }

  static fromUser(user) {
    return new CurrentUserDTO(
      user.first_name,
      user.last_name,
      user.email,
      user.role
    );
  }
}

export default CurrentUserDTO;
