import jwt from "jsonwebtoken";

export const verifyTokenExpiration = (req, res, next) => {
  const token = req.cookies.jwt || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No se otorgó un Token..." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    const errorMessage =
      err.name === "TokenExpiredError"
        ? "El Token expiró."
        : "El Token es Inválido...";
    return res.status(401).json({
      message: errorMessage,
      error: err.message,
    });
  }
};
