import { Server } from "socket.io";
import { generateId } from "../utils/collectionHandler.js";
import ProductManager from "../managers/ProductManager.js";

const productManager = new ProductManager();

export const config = (httpServer) => {
  const socketServer = new Server(httpServer);

  socketServer.on("connection", async (socket) => {
    console.log("La conexión está establecida!", socket.id);

    socket.emit("filtered-products", {
      products: await productManager.getAll(),
    });

    socket.on("insert-product", async (productData) => {
      try {
        const { title, price, stock, category, description, code, thumbnail } =
          productData;

        if (!title || !price || !stock || !category || !description || !code) {
          throw new Error("Te faltan datos que son obligatorios...");
        }

        const product = {
          id: generateId(await productManager.getAll()),
          title,
          price: Number(price),
          stock: Number(stock),
          category,
          description,
          code,
          status: true,
          thumbnail: thumbnail ? thumbnail : null,
          timestamp: new Date(),
        };

        await productManager.insertOne(product);

        socketServer.emit("filtered-products", {
          products: await productManager.getAll(),
        });

        socket.emit("success-message", {
          message: "Agregaste éxitosamente tu producto a la lista!",
        });
      } catch (error) {
        console.error("Hubo un error al querer agregar tu producto:", error);
        socket.emit("error-message", { message: error.message });
      }
    });

    socket.on("delete-product", async (data) => {
      try {
        const result = await productManager.deleteOneById(Number(data.id));
        console.log("Eliminaste este producto...:", result);

        socketServer.emit("filtered-products", {
          products: await productManager.getAll(),
        });

        socket.emit("success-message", {
          message: "Eliminaste tu producto con éxito!",
        });
      } catch (error) {
        console.error(
          "Hubo un error al querer eliminar tu producto...:",
          error
        );
        socket.emit("error-message", { message: error.message });
      }
    });

    socket.on("update-product", async (data, file) => {
      try {
        const { id, title, price, stock, category, description, code, status } =
          data;

        const updatedProductData = {};
        if (title) updatedProductData.title = title;
        if (price) updatedProductData.price = price;
        if (stock) updatedProductData.stock = stock;
        if (category) updatedProductData.category = category;
        if (description) updatedProductData.description = description;
        if (code) updatedProductData.code = code;
        if (status !== undefined) updatedProductData.status = status;

        if (file) updatedProductData.thumbnail = file.filename;

        const updatedProduct = await productManager.updateOneById(
          id,
          updatedProductData,
          file
        );

        socketServer.emit("filtered-products", {
          products: await productManager.getAll(),
        });

        socket.emit("success-message", {
          message: "Actualizaste tu producto con éxito!",
        });
      } catch (error) {
        console.error(
          "Hubo un error al querer actualizar este producto...:",
          error
        );
        socket.emit("error-message", { message: error.message });
      }
    });

    socket.on("get-products-by-category", async (category) => {
      try {
        const filteredProducts = await productManager.getByCategory(category);
        socket.emit("filtered-products", { products: filteredProducts });
      } catch (error) {
        socket.emit("error-message", { message: error.message });
      }
    });

    socket.on("get-categories", async () => {
      try {
        const categories = await productManager.getCategories();
        socket.emit("categories-list", { categories });
      } catch (error) {
        socket.emit("error-message", { message: error.message });
      }
    });

    socket.on("search-product-by-id", async (data) => {
      try {
        const product = await productManager.getOneById(Number(data.id));

        if (product) {
          socket.emit("product-found", { product });
        } else {
          socket.emit("error-message", {
            message: "Este producto no fue encontrado...",
          });
        }
      } catch (error) {
        socket.emit("error-message", { message: error.message });
      }
    });

    socket.on("get-all-products", async () => {
      try {
        const allProducts = await productManager.getAll();
        socket.emit("filtered-products", { products: allProducts });
      } catch (error) {
        socket.emit("error-message", { message: error.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("El cliente se desconectó...");
    });
  });
};
