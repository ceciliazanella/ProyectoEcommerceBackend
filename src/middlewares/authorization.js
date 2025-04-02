export const authorization = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect("/login");
    }

    if (role && req.user.role !== role) {
      return res
        .status(403)
        .json({
          message: `❌ No podés Acceder a esta Chocosesión! Tenés que ser 👤 ${role} para poder hacerlo...`,
        });
    }

    next();
  };
};
