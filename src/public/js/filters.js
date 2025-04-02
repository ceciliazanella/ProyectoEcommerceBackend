document.addEventListener("DOMContentLoaded", function () {
  const path = window.location.pathname;

  if (path === "/" || path.startsWith("/products")) {
    applyFilters(1);
  }

  addFilterListeners();
});

async function loadProductsList(
  page = 1,
  category = "",
  price = "",
  availability = "",
  search = ""
) {
  try {
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
      renderProducts(data.payload.products);

      updatePagination(data.payload.currentPage, data.payload.totalPages);
    } else {
      showNotification("❌ No se encontraron Productos...", "error");
    }
  } catch (error) {
    console.error("❌ Hubo un error al querer Cargar los Productos:", error);
  }
}

function applyFilters(page = 1) {
  const category = document.getElementById("category").value;

  const price = document.getElementById("price").value;

  const availability = document.getElementById("availability").value;

  const search = document.getElementById("search").value;

  loadProductsList(page, category, price, availability, search);
}

function addFilterListeners() {
  document
    .getElementById("category")
    .addEventListener("change", () => applyFilters(1));
  document
    .getElementById("price")
    .addEventListener("change", () => applyFilters(1));
  document
    .getElementById("availability")
    .addEventListener("change", () => applyFilters(1));
  document
    .getElementById("search")
    .addEventListener("input", () => applyFilters(1));
}
