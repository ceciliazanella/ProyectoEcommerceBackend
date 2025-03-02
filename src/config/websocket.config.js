import { Server } from "socket.io";
import ProductManager from "../managers/ProductManager.js";
import CartManager from "../managers/CartManager.js";

const productManager = new ProductManager();

const cartManager = new CartManager();

export const config = (httpServer) => {
  const socketServer = new Server(httpServer);
  socketServer.on("connection", async (socket) => {
    console.log("Se estableció Conexión...", socket.id);

    const calculateCartTotal = (products) => {
      return products.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0
      );
    };

    const sendProductList = async (page = 1, limit = 10) => {
      const products = await productManager.getAll({ page, limit });
      socket.emit("products-list", {
        products: products.docs,
        totalPages: products.totalPages,
        currentPage: page,
      });
    };
    await sendProductList(1, 10);

    const updateProductList = async () => {
      socketServer.emit("products-list", {
        products: await productManager.getAll(),
      });
    };

    socket.on("insert-product", async (data) => {
      try {
        await productManager.insertOne(data);
        await updateProductList();
      } catch (error) {
        socket.emit("error-message", { message: error.message });
      }
    });

    socket.on("delete-product", async (data) => {
      try {
        await productManager.deleteOneById(Number(data.id));
        await updateProductList();
      } catch (error) {
        socket.emit("error-message", { message: error.message });
      }
    });

    socket.on("get-cart", async (cartId) => {
      try {
        const cart = await cartManager.getOneById(cartId);
        const cartData = {
          cartId: cart._id,
          products: cart.products,
          total: calculateCartTotal(cart.products),
        };
        socket.emit("cart-updated", cartData);
      } catch (error) {
        socket.emit("error-message", { message: error.message });
      }
    });

    socket.on("add-product-to-cart", async (data) => {
      try {
        const { cartId, productId, quantity } = data;
        const updatedCart = await cartManager.addOneProduct(
          cartId,
          productId,
          quantity
        );

        const cartData = {
          cartId: updatedCart._id,
          products: updatedCart.products,
          total: calculateCartTotal(updatedCart.products),
        };
        socketServer.emit("cart-updated", cartData);
      } catch (error) {
        socket.emit("error-message", { message: error.message });
      }
    });

    socket.on("remove-product-from-cart", async (data) => {
      try {
        const { cartId, productId } = data;
        await cartManager.removeProduct(cartId, productId);
        const updatedCart = await cartManager.getOneById(cartId);
        const cartData = {
          cartId: updatedCart._id,
          products: updatedCart.products,
          total: calculateCartTotal(updatedCart.products),
        };
        socketServer.emit("cart-updated", cartData);
      } catch (error) {
        socket.emit("error-message", { message: error.message });
      }
    });

    socket.on("update-product-quantity", async (data) => {
      try {
        const { cartId, productId, quantity } = data;
        await cartManager.updateProductQuantity(cartId, productId, quantity);
        const updatedCart = await cartManager.getOneById(cartId);
        const cartData = {
          cartId: updatedCart._id,
          products: updatedCart.products,
          total: calculateCartTotal(updatedCart.products),
        };
        socketServer.emit("cart-updated", cartData);
      } catch (error) {
        socket.emit("error-message", { message: error.message });
      }
    });

    socket.on("get-products", async (data) => {
      const { page, limit } = data;
      await sendProductList(page || 1, limit || 10);
    });

    socket.on("error", (errorMessage) => {
      socket.emit("error-message", { message: errorMessage });
    });

    socket.on("disconnect", () => {
      console.log("El Cliente se desconectó...", socket.id);
    });
  });
};
