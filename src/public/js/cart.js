async function loadCart() {
  try {
    const response = await fetch("/api/carts");

    const cartData = await response.json();

    if (cartData && cartData.payload) {
      updateCartView(cartData.payload);
    } else {
      console.log("❌ El Carrito está vacío o no se pudo encontrar...");
    }
  } catch (error) {
    console.log(
      "❌ Hubo un problema al querer Cargar el Carrito de Compras...",
      error
    );
  }
}

if (window.location.pathname === "/cart") {
  loadCart();
}

let searchQuery = "";

const searchInput = document.getElementById("search-input");

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;

  loadCart(searchQuery);
});

document.getElementById("empty-cart-btn").addEventListener("click", () => {
  if (confirm("¿Estás seguro de querer Vaciar tu Chococarrito? 🗑️")) {
    emptyCart();
  }
});

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
      showNotification("❌ No se encontró este Producto...", "error");

      return;
    }

    const product = productData.payload;

    if (product.stockInitial <= 0) {
      showNotification(
        "❌ Este Producto no cuenta con Stock suficiente...",
        "error"
      );

      return;
    }

    const cartResponse = await fetch(`/api/carts/${cartId}`);
    if (cartResponse.status === 404) {
      showNotification("❌ Carrito no encontrado...", "error");

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
          `❌ No podés Agregar más de ${product.stockInitial} Unidades de este Producto! Sólo quedan ${product.stockInitial} Unidades...`,
          "error"
        );

        return;
      }
      await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      showNotification(
        "✔️ Se Actualizó la Cantidad de este Chocoproducto en tu Chococarrito!",
        "success"
      );
    } else {
      await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      showNotification("✔️ Agregaste este Chocoproducto a tu Chococarrito!", "success");
    }
  } catch (error) {
    showNotification(
      "❌ Hubo un problema al querer Agregar este Chocoproducto a tu Chococarrito o no tenés Autorización para hacerlo...",
      "error"
    );
  }
}

async function getOrCreateCart() {
  if (typeof Storage === "undefined") {
    showNotification(
      "❌ El Almacenamiento Local no está disponible...",
      "error"
    );

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
      throw new Error("❌ Mmm... No se pudo crear el Carrito...");
    }
  } catch (error) {
    return null;
  }
}

async function loadCart(search = "") {
  try {
    const cartId = await getOrCreateCart();

    console.log("🛒 cartId:", cartId);

    if (!cartId) return;

    const response = await fetch(`/api/carts/${cartId}`);

    console.log("📝 Respuesta Json:", response);

    const data = await response.json();

    console.log("📑 Datos Obtenidos:", data);

    if (
      data.success === true &&
      data.payload &&
      data.payload.products &&
      data.payload.products.length > 0
    ) {
      const filteredProducts = filterProductsBySearchQuery(
        data.payload.products,
        search
      );

      console.log("📄 Productos Filtrados:", filteredProducts);

      updateCartView(filteredProducts);
    } else {
      showEmptyCartMessage();
    }
  } catch (error) {
    console.log(error);

    showNotification(
      "❌ Hubo un problema al querer Cargar tu Carrito...",
      "error"
    );
  }
}

function filterProductsBySearchQuery(products, searchQuery) {
  if (!searchQuery) return products;

  searchQuery = searchQuery.toLowerCase();

  return products.filter((item) => {
    const title = item.product.title.toLowerCase();

    const description = item.product.description.toLowerCase();

    return title.includes(searchQuery) || description.includes(searchQuery);
  });
}

function showEmptyCartMessage() {
  const cartContainer = document.getElementById("cart-products");

  if (cartContainer) {
    cartContainer.innerHTML = "<p>❌ No hay Productos en tu Chococarrito!</p>";
  }

  const totalElement = document.getElementById("cart-total");
  if (totalElement) {
    totalElement.textContent = "💲 Total a Pagar: $0.00";
  }
}

function updateCartView(filteredProducts) {
  const cartProductsElement = document.getElementById("cart-products");

  cartProductsElement.innerHTML = "";

  let total = 0;

  if (filteredProducts.length > 0) {
    filteredProducts.forEach((product) => {
      const productId = product.product._id;
      const title = product.product.title;
      const price = product.product.price;
      const quantity = product.quantity;
      const stockInitial = product.product.stockInitial;

      const productElement = document.createElement("div");

      productElement.classList.add("cart-item");

      productElement.setAttribute("data-product-id", productId);

      productElement.innerHTML = `
        <p>${title}</p>
        <p>Precio $${price}</p>
        <p>Cantidad:
          <input type="number" id="quantity-input-${productId}" value="${quantity}" min="1" max="${stockInitial}" />
          <button class="update-quantity-btn" data-product-id="${productId}">Actualizar ✏️</button>
          <p class="stock-warning" id="stock-warning-${productId}" style="color: red; display: none;">
            ❌ Sólo quedan ${stockInitial} Unidades Disponibles de este Producto!
          </p>
        </p>
        <button class="remove-from-cart-btn" data-product-id="${productId}">Eliminar 🗑️</button>
      `;

      cartProductsElement.appendChild(productElement);

      total += price * quantity;
    });
  } else {
    cartProductsElement.innerHTML = "<p>❌ No se encontraron Productos...</p>";
  }

  const totalElement = document.getElementById("cart-total");

  if (totalElement) {
    totalElement.textContent = `💲 Total a Pagar $${total.toFixed(2)}`;
  }

  addEventListenersToButtons();
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
      showNotification(
        "❌ Este Producto no se encuentra en tu Chococarrito!",
        "error"
      );

      return;
    }

    const stockInitial = product.product.stockInitial;

    const input = document.getElementById(`quantity-input-${productId}`);

    let newQuantity = parseInt(input.value);

    if (newQuantity > stockInitial) {
      document.getElementById(`stock-warning-${productId}`).style.display =
        "block";

      showNotification(
        `❌ No podés Agregar más de ${stockInitial} Unidades de este Producto! Sólo quedan ${stockInitial} Unidades...`,
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
    if (updateData.success === true) {
      showNotification(
        "✔️ Se Actualizó la Cantidad de este Chocoproducto con Éxito!",
        "success"
      );

      loadCart();
    } else {
      showNotification(
        "❌ Hubo un Error al querer Actualizar la Cantidad de este Chocoproducto...",
        "error"
      );
    }
  } catch (error) {
    showNotification(
      "❌ Hubo un problema al querer Actualizar la Cantidad de este Chocoproducto...",
      "error"
    );
  }
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

async function removeFromCart(productId) {
  try {
    const cartId = await getOrCreateCart();
    if (!cartId) return;

    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (data.success === true) {
      showNotification("✔️ Este Chocoproducto se Eliminó con Éxito!", "success");

      loadCart(searchQuery);
    } else {
      showNotification(
        "❌ Hubo un problema al querer Eliminar este Chocoproducto...",
        "error"
      );
    }
  } catch (error) {
    showNotification(
      "❌ Hubo un problema al intentar Eliminar este Chocoproducto...",
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
      showNotification("✔️ Se Vació tu Chococarrito de Productos!", "success");

      showEmptyCartMessage();

      loadCart();
    } else {
      showNotification(
        "❌ Hubo un problema al intentar Vaciar tu Chococarrito...",
        "error"
      );
    }
  } catch (error) {
    showNotification(
      "❌ Hubo un problema al querer Vaciar tu Chococarrito...",
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

    if (data.success === true) {
      loadCart(searchQuery);
    } else {
      showNotification(
        "❌ Hubo un problema al querer Actualizar tu Chococarrito...",
        "error"
      );
    }
  } catch (error) {
    showNotification(
      "❌ Hubo un problema al querer Actualizar tu Chococarrito...",
      "error"
    );
  }
}
