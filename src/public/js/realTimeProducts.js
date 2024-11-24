const socket = io();

const categoryFilterForm = document.getElementById("category-filter-form");
const categorySelect = document.getElementById("category");
const productsList = document.getElementById("products-list");
const productDetailsSection = document.getElementById(
  "product-details-section"
);
const productDetailsDiv = document.getElementById("product-details");
const backToProductsListBtn = document.getElementById("back-to-products-list");
const addProductForm = document.getElementById("add-product-form");
const searchProductBtn = document.getElementById("btn-search-product");
const searchProductIdInput = document.getElementById("product-id-search");

socket.emit("get-categories");

socket.on("categories-list", (data) => {
  const categories = data.categories;
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
});

categoryFilterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const selectedCategory = categorySelect.value;
  if (selectedCategory === "all") {
    socket.emit("get-all-products");
  } else {
    socket.emit("get-products-by-category", selectedCategory);
  }
});

searchProductBtn.addEventListener("click", () => {
  const productId = searchProductIdInput.value.trim();
  if (productId) {
    socket.emit("search-product-by-id", { id: productId });
  }
});

socket.on("product-found", (data) => {
  const product = data.product;
  productDetailsDiv.innerHTML = `
    <h5>${product.category}</h5>
    <h5>${product.code}</h5>
    <h4>${product.title}</h4>
    <img src="/images/${product.thumbnail}" alt="Imagen de ${product.title}" />
    <h4>$${product.price}</h4>
    <h5>Stock ${product.stock}</h5>
    <h5>${product.status ? "Disponible" : "No Disponible"}</h5>
  `;
  productDetailsSection.style.display = "block";
});

backToProductsListBtn.addEventListener("click", () => {
  productDetailsSection.style.display = "none";
});

addProductForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newTitle = document.getElementById("product-title").value;
  const newDescription =
    document.getElementById("product-description").value || "";
  const newCode = document.getElementById("product-code").value || "";
  const newPrice = document.getElementById("product-price").value;
  const newStock = document.getElementById("product-stock").value;
  const newCategory = document.getElementById("product-category").value;
  const newThumbnail =
    document.getElementById("product-thumbnail").files[0] || null;

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
      thumbnail: null,
    };

    if (newThumbnail) {
      const reader = new FileReader();
      reader.onloadend = () => {
        productData.thumbnail = reader.result.split(",")[1];
        socket.emit("insert-product", productData);
      };
      reader.readAsDataURL(newThumbnail);
    } else {
      socket.emit("insert-product", productData);
    }
  } else {
    alert("Por favor, completá todos los campos obligatorios...");
  }
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

socket.on("success-message", (data) => {
  showMessage("success", data.message);
});

socket.on("error-message", (data) => {
  showMessage("error", data.message);
});

productsList.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const productId = e.target.getAttribute("data-id");
    if (confirm("¿Estás seguro/a que querés eliminar este producto?")) {
      socket.emit("delete-product", { id: productId });
    }
  }

  if (e.target.classList.contains("update-btn")) {
    const productId = e.target.getAttribute("data-id");
    const updateSection = document.getElementById(`update-${productId}`);
    if (updateSection) {
      updateSection.style.display =
        updateSection.style.display === "none" ? "block" : "none";
    }
  }

  if (e.target.classList.contains("view-details-btn")) {
    const productId = e.target.getAttribute("data-id");
    const detailsSection = document.getElementById(`details-${productId}`);
    detailsSection.style.display =
      detailsSection.style.display === "none" ? "block" : "none";
  }

  if (e.target.classList.contains("close-details")) {
    const productId = e.target.getAttribute("data-id");
    const detailsSection = document.getElementById(`details-${productId}`);
    detailsSection.style.display = "none";
  }
});

productsList.addEventListener("submit", (e) => {
  if (e.target.id && e.target.id.startsWith("form-update-")) {
    e.preventDefault();

    const productId = e.target.getAttribute("data-id");
    const updatedProduct = {
      id: productId,
      title: document.getElementById(`update-title-${productId}`).value,
      price: parseFloat(
        document.getElementById(`update-price-${productId}`).value
      ),
      stock: parseInt(
        document.getElementById(`update-stock-${productId}`).value
      ),
      category: document.getElementById(`update-category-${productId}`).value,
      code: document.getElementById(`update-code-${productId}`).value,
      status: document.getElementById(`update-status-${productId}`).checked,
      description: document.getElementById(`update-description-${productId}`)
        .value,
    };

    socket.emit("update-product", updatedProduct);
  }
});

socket.on("filtered-products", (data) => {
  productsList.innerHTML = "";

  data.products.forEach((product) => {
    productsList.innerHTML += `
      <li id="product-${product.id}">
        <div class="product-summary">

          <h5>${product.category}</h5><br> 
          <h5>${product.code}</h5><br>  
          <h4>${product.title}</h4><br>   
          <h4>$${product.price}</h4><br>  
          <h5>Stock ${product.stock}</h5><br>  
          <h5>${product.status ? "Disponible" : "No Disponible"}</h5><br>   

          <button class="delete-btn" data-id="${product.id}">Eliminar</button>
          <button class="update-btn" data-id="${product.id}">Modificar</button>
          <button class="view-details-btn" data-id="${
            product.id
          }">Ver Detalle</button>

          <div class="product-details" id="details-${
            product.id
          }" style="display:none;">
            <p>${product.description}</p>
            <button class="close-details" data-id="${
              product.id
            }">Cerrar Detalle</button>
          </div>

          <div class="product-update" id="update-${
            product.id
          }" style="display:none;">
            <form id="form-update-${product.id}" data-id="${product.id}">
              <label for="update-category-${product.id}">Categoría</label>
              <input type="text" id="update-category-${product.id}" value="${
      product.category
    }" required />

              <label for="update-code-${product.id}">Código del Producto</label>
              <input type="text" id="update-code-${product.id}" value="${
      product.code
    }" required />

              <label for="update-title-${product.id}">Título</label>
              <input type="text" id="update-title-${product.id}" value="${
      product.title
    }" required />

              <label for="update-description-${product.id}">Descripción</label>
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

              <button type="submit">Actualizar Producto</button>
            </form>
          </div>
        </div>
      </li>`;
  });
});

socket.emit("get-all-products");
