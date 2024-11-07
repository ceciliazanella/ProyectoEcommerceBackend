router.get("/category/:category", async (req, res) => {
  const { category } = req.params;

  try {
    const categoryLower = category.toLowerCase();

    const products = await productManager.getAll();

    const filteredProducts = products.filter(
      (product) => product.category.toLowerCase() === categoryLower
    );

    if (filteredProducts.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No se encontraron productos en esta categoría...",
      });
    }

    res.json({
      status: "success",
      message: "Productos obtenidos por categoría...",
      products: filteredProducts,
    });
  } catch (err) {
    console.error("Error al querer obtener productos por categoría:", err);
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor.",
    });
  }
});
