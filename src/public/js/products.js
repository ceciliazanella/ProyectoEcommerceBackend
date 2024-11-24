const loadProductsList = async () => {
  try {
    const response = await fetch("/api/products", { method: "GET" });
    const products = await response.json();

    if (Array.isArray(products) && products.length > 0) {
      const productsList = document.getElementById("products-list");
      productsList.innerHTML = "";

      products.forEach((product) => {
        const productItem = document.createElement("li");

        const productImage =
          product.thumbnails && product.thumbnails.length > 0
            ? `<img src="${product.thumbnails[0]}" alt="Imagen de ${product.title}" style="width: 50px;">`
            : "";

        productItem.innerHTML = `
            <div class="products">
              <h5>${product.category}</h5><br>
              <h5>${product.code}</h5><br>
              <h4>${product.title}</h4><br>
              ${productImage}<br>
              <h4>$${product.price}</h4><br>
              <h5>Stock</h5> ${product.stock}<br> 
              ${product.status ? "Disponible" : "No Disponible"}<br>
            </div>

              <button class="btn-view-details" data-id="${
                product.id
              }">Ver Detalle</button>
              <button class="btn-update-product" data-id="${
                product.id
              }">Modificar</button>
              <button class="btn-delete-product" data-id="${
                product.id
              }">Eliminar</button>

            <div class="product-details" id="details-${
              product.id
            }" style="display:none;">
              <p>${product.description}</p>
            </div>

            <div class="product-update-form" id="update-form-${
              product.id
            }" style="display:none;">
              <h4>Modificar Producto</h4>

              <form id="form-update-${product.id}">

                <label for="update-category-${product.id}">Categoría</label>
                <input type="text" id="update-category-${product.id}" value="${
          product.category
        }" required />

                <label for="update-code-${
                  product.id
                }">Código del Producto</label>
                <input type="text" id="update-code-${product.id}" value="${
          product.code
        }" required />

                <label for="update-title-${product.id}">Nombre</label>
                <input type="text" id="update-title-${product.id}" value="${
          product.title
        }" required />
  
                <label for="update-description-${
                  product.id
                }">Descripción</label>
                <textarea id="update-description-${product.id}" required>${
          product.description
        }</textarea>
  
                <label for="update-price-${product.id}">Precio</label>
                <input type="number" id="update-price-${product.id}" value="${
          product.price
        }" required />
  
                <label for="update-stock-${product.id}">Stock</label>
                <input type="number" id="update-stock-${product.id}" value="${
          product.stock
        }" required />
  
                <label for="update-status-${product.id}">Estado</label>
                <input type="checkbox" id="update-status-${product.id}" ${
          product.status ? "checked" : ""
        } />

                <button type="submit">Guardar Cambios</button>
              </form>
            </div>
          `;

        productsList.appendChild(productItem);
      });

      attachListenersToButtons();
    } else {
      displayError("No se encontraron productos...");
    }
  } catch (error) {
    displayError("Hubo un problema al querer cargar la lista de productos...");
  }
};

const updateProduct = async (productId) => {
  const title = document.getElementById(`update-title-${productId}`).value;
  const description = document.getElementById(
    `update-description-${productId}`
  ).value;
  const code = document.getElementById(`update-code-${productId}`).value;
  const price = document.getElementById(`update-price-${productId}`).value;
  const stock = document.getElementById(`update-stock-${productId}`).value;
  const status = document.getElementById(`update-status-${productId}`).checked;
  const category = document.getElementById(
    `update-category-${productId}`
  ).value;

  const productData = {
    title: title,
    description: description,
    code: code,
    price: parseFloat(price),
    stock: parseInt(stock),
    status: status,
    category: category,
  };

  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    if (response.ok) {
      displaySuccess("Modificaste con éxito tu producto!");

      const details = document.getElementById(`details-${productId}`);
      details.style.display = "none";
    } else {
      const errorData = await response.json();
      displayError(
        `Hubo un error al querer modificar tu producto...: ${
          errorData.message || "Desconocido"
        }`
      );
    }
  } catch (error) {
    displayError(
      `Hubo un error al querer modificar tu producto...: ${
        error.message || "Desconocido"
      }`
    );
  }
};

const deleteProduct = async (productId) => {
  const confirmDelete = confirm(
    "¿Estás seguro/a de que querés eliminar este producto?"
  );
  if (confirmDelete) {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        displaySuccess("Eliminaste con éxito tu producto!");
      } else {
        const errorData = await response.json();
        displayError(
          `Hubo un error al querer eliminar este producto...: ${
            errorData.message || "Desconocido"
          }`
        );
      }
    } catch (error) {
      displayError(
        `Hubo un error al querer eliminar este producto...: ${
          error.message || "Desconocido"
        }`
      );
    }
  }
};

const viewProductDetails = (productId) => {
  const details = document.getElementById(`details-${productId}`);
  details.style.display = details.style.display === "none" ? "block" : "none";
};

const addProductForm = document.getElementById("add-product-form");

addProductForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTitle = document.getElementById("new-title").value;
  const newDescription = document.getElementById("new-description").value || "";
  const newCode = document.getElementById("new-code").value || "";
  const newPrice = document.getElementById("new-price").value;
  const newStock = document.getElementById("new-stock").value;
  const newCategory = document.getElementById("new-category").value;
  const newThumbnails =
    document.getElementById("new-thumbnails").files[0] || null;

  if (
    newTitle &&
    newDescription &&
    newCode &&
    newPrice &&
    newStock &&
    newCategory
  ) {
    const productData = {
      title: newTitle,
      description: newDescription,
      code: newCode,
      price: parseFloat(newPrice),
      status: true,
      stock: parseInt(newStock),
      category: newCategory,
      thumbnail: newThumbnails,
    };

    const formData = new FormData();
    formData.append("title", newTitle);
    formData.append("description", newDescription);
    formData.append("code", newCode);
    formData.append("price", newPrice);
    formData.append("stock", newStock);
    formData.append("category", newCategory);
    formData.append("status", true);

    if (newThumbnails) {
      formData.append("thumbnail", newThumbnails);
    }

    fetch("/api/products", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Agregaste con éxito tu producto!:", data);
      })
      .catch((error) => {
        console.error("Hubo un error al querer agregar tu producto...:", error);
      });
  } else {
    console.error("Por favor, completá todos los campos obligatorios...");
  }
  displaySuccess("Se agregó con éxito tu producto!");
});

function showMessage(type, message) {
  const messageContainer = document.getElementById("message-container");
  const messageElement = document.createElement("div");

  messageElement.classList.add("message", type);
  messageElement.textContent = message;
  messageContainer.appendChild(messageElement);

  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}

function displaySuccess(message) {
  showMessage("success", message);
}

function displayError(message) {
  showMessage("error", message);
}

const attachListenersToButtons = () => {
  document.querySelectorAll(".btn-view-details").forEach((button) => {
    button.addEventListener("click", (e) =>
      viewProductDetails(e.target.dataset.id)
    );
  });

  document.querySelectorAll(".btn-update-product").forEach((button) => {
    button.addEventListener("click", (e) => {
      const updateForm = document.getElementById(
        `update-form-${e.target.dataset.id}`
      );

      updateForm.style.display =
        updateForm.style.display === "none" ? "block" : "none";
    });
  });

  document.querySelectorAll(".btn-delete-product").forEach((button) => {
    button.addEventListener("click", (e) => deleteProduct(e.target.dataset.id));
  });

  document.querySelectorAll(".product-update-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      updateProduct(e.target.id.split("-")[2]);
    });
  });
};

document
  .getElementById("btn-refresh-products-list")
  .addEventListener("click", loadProductsList);

document.addEventListener("DOMContentLoaded", loadProductsList);
