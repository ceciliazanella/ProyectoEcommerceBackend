const socket = io();

let searchQuery = "";

async function getOrCreateCart() {
  if (typeof Storage === "undefined") {
    showNotification("El Almacenamiento Local no está disponible...", "error");
    return null;
  }

  let cartId = localStorage.getItem("cartId");
  if (!cartId) {
    return null;
  }
  return cartId;
}

async function createNewCart() {
  try {
    const response = await fetch("/api/carts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: [] }),
    });

    const data = await response.json();

    if (data.status === "success" && data.payload) {
      localStorage.setItem("cartId", data.payload._id);
      return data.payload._id;
    } else {
      throw new Error("Mmm... No se pudo crear el Carrito...");
    }
  } catch (error) {
    return null;
  }
}

async function loadCart(search = "") {
  try {
    const cartId = await getOrCreateCart();
    if (!cartId) return;

    const response = await fetch(`/api/carts/${cartId}`);

    const data = await response.json();
    if (
      data.status === "success" &&
      data.payload &&
      data.payload.products &&
      data.payload.products.length > 0
    ) {
      const filteredProducts = filterProductsBySearchQuery(
        data.payload.products,
        search
      );

      updateCartView(filteredProducts);
    } else {
      showEmptyCartMessage();
    }
  } catch (error) {
    showNotification(
      "Hubo un problema al querer Cargar el Carrito...",
      "error"
    );
  }
}

function filterProductsBySearchQuery(products, searchQuery) {
  if (!searchQuery) return products;
  return products.filter((item) => {
    const title = item.product.title.toLowerCase();

    const description = item.product.description.toLowerCase();

    searchQuery = searchQuery.toLowerCase();
    return title.includes(searchQuery);
  });
}

function showEmptyCartMessage() {
  const cartContainer = document.getElementById("cart-products");
  if (cartContainer) {
    cartContainer.innerHTML = "<p>No hay Productos en tu Carrito!</p>";
  }

  const totalElement = document.getElementById("cart-total");
  if (totalElement) {
    totalElement.textContent = "Total a Pagar: $0.00";
  }
}

function updateCartView(products) {
  const cartContainer = document.getElementById("cart-products");

  const totalElement = document.getElementById("cart-total");

  if (!cartContainer || !totalElement) {
    return;
  }
  cartContainer.innerHTML = "";

  let total = 0;

  products.forEach((item) => {
    if (item.product) {
      const { _id: productId, price, stockInitial, title } = item.product;

      const { quantity } = item;

      cartContainer.innerHTML += `
        <div class="cart-item" data-product-id="${productId}">
          <p>${title}</p>
          <p>Precio $${price}</p>
          <p>Cantidad:
            <input type="number" id="quantity-input-${productId}" value="${quantity}" min="1" max="${stockInitial}" />
            <button class="update-quantity-btn" data-product-id="${productId}">Actualizar</button>
            <p class="stock-warning" id="stock-warning-${productId}" style="color: red; display: none;">
              Sólo quedan ${stockInitial} Unidades Disponibles de este Producto!
            </p>
          </p>
          <button class="remove-from-cart-btn">Eliminar</button>
        </div>
      `;
      total += price * quantity;
    }
  });
  totalElement.textContent = `Total a Pagar $${total.toFixed(2)}`;

  addEventListenersToButtons();
}

function addEventListenersToButtons() {
  document.querySelectorAll(".update-quantity-btn").forEach((button) => {
    button.addEventListener("click", (e) =>
      updateQuantity(e.target.dataset.productId)
    );
  });

  document.querySelectorAll(".remove-from-cart-btn").forEach((button) => {
    button.addEventListener("click", (e) => {
      const productId = e.target.closest(".cart-item").dataset.productId;

      updateCart("remove", productId);
    });
  });
}

async function updateQuantity(productId) {
  try {
    const cartId = await getOrCreateCart();
    if (!cartId) return;

    const response = await fetch(`/api/carts/${cartId}`);

    const data = await response.json();

    const cart = data.payload;

    const product = cart.products.find(
      (item) => item.product._id === productId
    );
    if (!product) {
      showNotification("Este Producto no se encuentra en tu Carrito!", "error");

      return;
    }

    const stockInitial = product.product.stockInitial;

    const input = document.getElementById(`quantity-input-${productId}`);

    let newQuantity = parseInt(input.value);

    if (newQuantity > stockInitial) {
      document.getElementById(`stock-warning-${productId}`).style.display =
        "block";

      showNotification(
        `No podés Agregar más de ${stockInitial} Unidades de este Producto! Sólo quedan ${stockInitial} Unidades...`,
        "error"
      );

      return;
    } else {
      document.getElementById(`stock-warning-${productId}`).style.display =
        "none";
    }

    const updateResponse = await fetch(
      `/api/carts/${cartId}/products/${productId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      }
    );

    const updateData = await updateResponse.json();
    if (updateData.status === "success") {
      showNotification(
        "Se Actualizó la Cantidad de este Producto con Éxito!",
        "success"
      );

      loadCart();
    } else {
      showNotification(
        "Hubo un Error al querer Actualizar la Cantidad de este Producto...",
        "error"
      );
    }
  } catch (error) {
    showNotification(
      "Hubo un problema al querer Actualizar la Cantidad de este Producto...",
      "error"
    );
  }
}

async function updateCart(action, productId) {
  try {
    const cartId = await getOrCreateCart();
    if (!cartId) return;

    const method = action === "remove" ? "DELETE" : "POST";

    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method,
    });

    const data = await response.json();

    if (data.status === "success") {
      loadCart(searchQuery);
    } else {
      showNotification(
        "Hubo un problema al querer Actualizar tu Carrito...",
        "error"
      );
    }
  } catch (error) {
    showNotification(
      "Hubo un problema al querer Actualizar tu Carrito...",
      "error"
    );
  }
}

async function addToCart(productId) {
  try {
    const cartId = await getOrCreateCart();
    if (!cartId) {
      window.location.href = "/login";
      return;
    }

    const productResponse = await fetch(`/api/products/${productId}`);

    const productData = await productResponse.json();
    if (productData.status !== "success" || !productData.payload) {
      showNotification("No se encontró este Producto...", "error");
      return;
    }

    const product = productData.payload;

    if (product.stockInitial <= 0) {
      showNotification(
        "Este Producto no cuenta con Stock suficiente...",
        "error"
      );
      return;
    }

    const cartResponse = await fetch(`/api/carts/${cartId}`);
    if (cartResponse.status === 404) {
      showNotification("Carrito no encontrado...", "error");
      return;
    }

    const cartData = await cartResponse.json();

    const cart = cartData.payload;

    const existingProductIndex = cart.products.findIndex(
      (p) => p.product._id === productId
    );

    if (existingProductIndex !== -1) {
      const existingProduct = cart.products[existingProductIndex];

      const newQuantity = existingProduct.quantity + 1;
      if (newQuantity > product.stockInitial) {
        showNotification(
          `No podés agregar más de ${product.stockInitial} Unidades de este Producto! Sólo quedan ${product.stockInitial} Unidades...`,
          "error"
        );
        return;
      }
      await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      showNotification("Se Actualizó la Cantidad en tu Carrito!", "success");
    } else {
      await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      showNotification("El Producto se Agregó al Carrito!", "success");
    }

    loadCart();
  } catch (error) {
    showNotification(
      "Hubo un problema al querer Agregar el Producto al Carrito...",
      "error"
    );
  }
}

async function emptyCart() {
  try {
    const cartId = await getOrCreateCart();
    if (!cartId) return;

    const response = await fetch(`/api/carts/${cartId}`, { method: "DELETE" });
    if (response.ok) {
      showNotification("Se vació tu Carrito de Productos!", "success");

      showEmptyCartMessage();

      loadCart();
    } else {
      showNotification(
        "Hubo un problema al intentar Vaciar los Productos de tu Carrito.",
        "error"
      );
    }
  } catch (error) {
    showNotification(
      "Hubo un problema al querer Vaciar los Productos del Carrito.",
      "error"
    );
  }
}

async function removeFromCart(productId) {
  try {
    const cartId = await getOrCreateCart();
    if (!cartId) return;

    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (data.status === "success") {
      showNotification("Producto Eliminado con Éxito!", "success");

      loadCart(searchQuery);
    } else {
      showNotification(
        "Hubo un problema al querer Eliminar el Producto...",
        "error"
      );
    }
  } catch (error) {
    showNotification(
      "Hubo un problema al intentar Eliminar el Producto...",
      "error"
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadCart();

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;

    loadCart(searchQuery);
  });

  document.getElementById("empty-cart-btn").addEventListener("click", () => {
    if (confirm("¿Estás seguro que querés Vaciar tu Carrito?")) {
      emptyCart();
    }
  });
});
