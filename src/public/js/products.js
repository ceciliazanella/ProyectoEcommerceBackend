let currentPage = 1;

let totalPages = 1;

let categories = [];

async function loadCategories() {
  try {
    const response = await fetch("/api/products/categories");

    const data = await response.json();
    if (data.status === "success") {
      categories = data.categories;

      loadCategoriesToSelect("category");

      loadCategoriesToSelect("new-category");
    }
  } catch (error) {
    console.error("Hubo un Error al querer Cargar las Categorías...:", error);
  }
}

function loadCategoriesToSelect(selectId) {
  const select = document.getElementById(selectId);

  select.innerHTML = "";

  const allOption = document.createElement("option");

  allOption.value = "";
  allOption.textContent = "Todas las Categorías";
  select.appendChild(allOption);

  categories.forEach((category) => {
    const option = document.createElement("option");

    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
}

async function loadProductsList(page = 1) {
  try {
    const category = document.getElementById("category").value;

    const price = document.getElementById("price").value;

    const availability = document.getElementById("availability").value;

    const search = document.getElementById("search").value;

    const url = new URL("/api/products", window.location.origin);

    const params = {
      page,
      category: category === "Todas las Categorías" ? "" : category,
      sort:
        price === "asc" ? "price_asc" : price === "desc" ? "price_desc" : "",
      title: search,
    };
    if (availability === "available") {
      params.stock = "1";
    }
    Object.keys(params).forEach((key) => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });

    const response = await fetch(url);

    const data = await response.json();
    if (data.status === "success") {
      renderProducts(data.payload.docs);

      updatePagination(data.payload.page, data.payload.totalPages);
    } else {
      showNotification("No se encontraron Productos...", "error");
    }
  } catch (error) {
    console.error("Hubo un Error al querer Cargar los Productos...:", error);
  }
}

function renderProducts(products) {
  const productList = document.getElementById("products-list");
  productList.innerHTML = "";
  if (products.length === 0) {
    productList.innerHTML = "<p>No se encontraron Productos...</p>";
    return;
  }
  products.forEach((product) => {
    const productItem = document.createElement("li");

    productItem.classList.add("product-item");

    const availability = product.stock > 0 ? "Disponible" : "No disponible";

    const productImage =
      product.thumbnails && product.thumbnails.length > 0
        ? product.thumbnails[0]
        : "./images/default-product-image.webp";
    productItem.innerHTML = `
      <div class="product" id="product-${product._id}">
        <h4>${product.title}</h4>
        <img src="${productImage}" alt="${product.title}" />
        <p id="price-${product._id}">Precio $${product.price.toFixed(2)}</p>
        <button onclick="toggleDetails('${product._id}', '${
      product.description
    }')">Ver Detalles</button>
        <div id="details-${
          product._id
        }" class="product-details" style="display: none;"></div>
        <button onclick="addToCart('${product._id}')" id="add-to-cart-${
      product._id
    }" ${product.stock === 0 ? "disabled" : ""}>${
      product.stock === 0 ? "Sin stock" : "Agregar al Carrito"
    }</button>
        <button onclick="openEditForm('${product._id}')">Modificar</button>
        <button onclick="deleteProduct('${product._id}')">Eliminar</button>
      </div>
    `;
    productList.appendChild(productItem);
  });
}

function toggleDetails(productId, description) {
  const detailsDiv = document.getElementById(`details-${productId}`);
  if (detailsDiv.style.display === "none") {
    detailsDiv.style.display = "block";
    detailsDiv.innerHTML = `<p>${description}</p>`;
  } else {
    detailsDiv.style.display = "none";
    detailsDiv.innerHTML = "";
  }
}

function updatePagination(currentPage, totalPages) {
  const prevPageButton = document.getElementById("prev-page");

  const nextPageButton = document.getElementById("next-page");

  prevPageButton.disabled = currentPage <= 1;
  nextPageButton.disabled = currentPage >= totalPages || totalPages === 0;
  prevPageButton.onclick = function () {
    if (currentPage > 1) {
      loadProductsList(currentPage - 1);
    }
  };
  nextPageButton.onclick = function () {
    if (currentPage < totalPages) {
      loadProductsList(currentPage + 1);
    }
  };
}

function changePage(newPage) {
  if (newPage < 1 || newPage > totalPages) return;

  loadProductsList(newPage);
}

function showNotification(message, type = "success") {
  const notification = document.createElement("div");

  notification.classList.add("notification");
  notification.style.backgroundColor = type === "success" ? "green" : "red";
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function addFilterListeners() {
  document.getElementById("category").addEventListener("change", function () {
    loadProductsList(1);
  });
  document.getElementById("price").addEventListener("change", function () {
    loadProductsList(1);
  });
  document
    .getElementById("availability")
    .addEventListener("change", function () {
      loadProductsList(1);
    });
  document.getElementById("search").addEventListener("input", function () {
    loadProductsList(1);
  });
}

async function openEditForm(productId) {
  try {
    const existingForm = document.getElementById("edit-product-form");
    if (existingForm) {
      if (existingForm.style.display === "block") {
        existingForm.style.display = "none";
        return;
      }
      existingForm.style.display = "block";
    } else {
      const response = await fetch(`/api/products/${productId}`);

      const data = await response.json();
      if (data.status === "success") {
        const product = data.payload;

        const editForm = document.createElement("form");

        editForm.id = "edit-product-form";
        editForm.enctype = "multipart/form-data";
        editForm.innerHTML = `
          <h3>Modificar Producto</h3>
          <label for="title">Título</label>
          <input type="text" id="edit-title" name="title" value="${
            product.title
          }" required>
          <label for="price">Precio</label>
          <input type="number" id="edit-price" name="price" value="${
            product.price
          }" required>
          <label for="stock">Stock</label>
          <input type="number" id="edit-stock" name="stock" value="${
            product.stock
          }" required>
          <label for="description">Descripción</label>
          <textarea id="edit-description" name="description">${
            product.description
          }</textarea>
          <label for="code">Código</label>
          <input type="text" id="edit-code" name="code" value="${
            product.code || ""
          }" required>
          <label for="category">Categoría</label>
          <select id="edit-category" name="category" required></select>
          <button type="submit">Guardar Cambios</button>
        `;

        const productContainer = document.getElementById(
          `product-${productId}`
        );
        if (productContainer) {
          productContainer.appendChild(editForm);
        }

        loadCategoriesToSelect("edit-category");

        editForm.addEventListener("submit", function (event) {
          event.preventDefault();
          updateProduct(productId);
        });
      }
    }
  } catch (error) {
    console.error(
      "Hubo un Error al querer Cargar el Formulario de Edición...:",
      error
    );
  }
}

async function updateProduct(productId) {
  try {
    const title = document.getElementById("edit-title").value;

    const price = parseFloat(document.getElementById("edit-price").value);

    const stock = parseInt(document.getElementById("edit-stock").value);

    const description = document.getElementById("edit-description").value;

    const code = document.getElementById("edit-code").value || "";

    const category = document.getElementById("edit-category").value;

    const productData = {
      title,
      price,
      stock,
      description,
      code,
      category,
    };

    const response = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    if (data.status === "success") {
      showNotification("Este Producto se Actualizó Éxitosamente!", "success");

      loadProductsList(currentPage);
    } else {
      showNotification(
        "Hubo un Error al querer Actualizar este Producto...",
        "error"
      );
      console.error("Error en la Respuesta del Backend:", data.message);
    }
  } catch (error) {
    console.error(
      "Hubo un Error al querer Actualizar este Producto...:",
      error
    );

    showNotification(
      "Hubo un Error al querer Actualizar este Producto...",
      "error"
    );
  }
}

function createAddProductForm() {
  const addProductSection = document.getElementById("addProductForm");

  const addForm = document.createElement("form");

  addForm.id = "add-product-form";
  addForm.enctype = "multipart/form-data";
  addForm.innerHTML = `
    <label for="new-category">Categoría</label>
    <select id="new-category" name="category" required></select>

    <label for="new-code">Código</label>
    <input type="text" id="new-code" name="code" required />

    <label for="new-title">Nombre</label>
    <input type="text" id="new-title" name="title" required />

    <label for="new-thumbnails">Imagen (Opcional)</label>
    <input type="file" id="new-thumbnails" name="thumbnails" accept="image/*" />

    <label for="new-description">Descripción</label>
    <textarea id="new-description" name="description" required></textarea>

    <label for="new-price">Precio</label>
    <input type="number" id="new-price" name="price" required />

    <label for="new-stock">Stock</label>
    <input type="number" id="new-stock" name="stock" required />

    <label for="new-status">Estado</label>
    <select id="new-status" name="status" required>
      <option value="true">Activo</option>
      <option value="false">Inactivo</option>
    </select>

    <button type="submit">Agregar Producto</button>
  `;
  addProductSection.innerHTML = "<h3>Agregar Producto</h3>";
  addProductSection.appendChild(addForm);

  loadCategoriesToSelect("new-category");

  addForm.addEventListener("submit", function (event) {
    event.preventDefault();

    addProduct();
  });
}

async function addProduct() {
  try {
    const title = document.getElementById("new-title").value;

    const price = parseFloat(document.getElementById("new-price").value);

    const stock = parseInt(document.getElementById("new-stock").value);

    const description = document.getElementById("new-description").value;

    const code = document.getElementById("new-code").value;

    const category = document.getElementById("new-category").value;

    const status =
      document.getElementById("new-status").value === "true" ? true : false;

    const productData = {
      title,
      price,
      stock,
      description,
      code,
      category,
      status,
      thumbnails: document.getElementById("new-thumbnails").files[0] || null,
    };

    const formData = new FormData();

    for (let key in productData) {
      formData.append(key, productData[key]);
    }

    const response = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.status === "success") {
      showNotification("Este Producto se Agregó Éxitosamente!", "success");

      loadProductsList(currentPage);
    } else {
      showNotification(data.message, "error");
    }
  } catch (error) {
    showNotification(
      "Hubo un Error al querer Agregar este Producto...:",
      "error"
    );
  }
}

async function deleteProduct(productId) {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.status === "success") {
      showNotification("Este Producto se eliminó Éxitosamente!", "success");

      loadProductsList(currentPage);
    } else {
      showNotification(
        "Hubo un Error al querer Eliminar este Producto...",
        "error"
      );
    }
  } catch (error) {
    showNotification(
      "Hubo un Error al querer Eliminar este Producto...",
      "error"
    );
  }
}

loadCategories();

loadProductsList(currentPage);

createAddProductForm();

addFilterListeners();

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  if (type === "success") {
    notification.style.backgroundColor = "green";
  } else {
    notification.style.backgroundColor = "red";
  }
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
