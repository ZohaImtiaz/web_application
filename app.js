
// Global State
// Stores product data, cart contents and the currently viewed product.
let products = [];
let cart = [];
let currentProduct = null;

// DOM References
// Cached references to all major UI elements for performance.
const views = document.querySelectorAll(".view");
const navLinks = document.querySelectorAll("[data-view]");
const cartCountSpan = document.getElementById("cart-count");

// Browse view elements
const productsGrid = document.getElementById("products-grid");
const noResultsP = document.getElementById("no-results");
const sortSelect = document.getElementById("sort-select");
const filterTagsDiv = document.getElementById("filter-tags");
const clearFiltersBtn = document.getElementById("clear-filters");
const genderCheckboxes = document.querySelectorAll(".filter-gender");
const filterCategoryDiv = document.getElementById("filter-category");
const filterSizeDiv = document.getElementById("filter-size");
const filterColorDiv = document.getElementById("filter-color");

// Product view elements
const breadcrumbsNav = document.getElementById("breadcrumbs");
const productTitleEl = document.getElementById("product-title");
const productPriceEl = document.getElementById("product-price");
const productDescEl = document.getElementById("product-description");
const productMaterialEl = document.getElementById("product-material");
const productQtyInput = document.getElementById("product-qty");
const sizeOptionsDiv = document.getElementById("size-options");
const colorOptionsDiv = document.getElementById("color-options");
const addToCartBtn = document.getElementById("add-to-cart-btn");
const addToCartMsg = document.getElementById("add-to-cart-msg");

// Cart view elements
const cartBody = document.getElementById("cart-body");
const emptyCartMsg = document.getElementById("empty-cart-msg");
const shipDestinationSelect = document.getElementById("ship-destination");
const shipMethodRadios = document.getElementsByName("ship-method");
const totalMerchSpan = document.getElementById("total-merch");
const totalShippingSpan = document.getElementById("total-shipping");
const totalTaxSpan = document.getElementById("total-tax");
const totalFinalSpan = document.getElementById("total-final");
const checkoutBtn = document.getElementById("checkout-btn");
const checkoutMsg = document.getElementById("checkout-msg");

// About dialog
const aboutDialog = document.getElementById("about-dialog");
const aboutBtn = document.getElementById("about-btn");

// Filter State
// Tracks all active filters for gender, category, size, and color.
const filterState = {
  genders: [],
  categories: [],
  sizes: [],
  colors: []
};

// Initialization
// Sets up navigation, dialogs, event listeners, and loads products.
window.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupAboutDialog();
  setupBrowseEvents();
  setupProductEvents();
  setupCartEvents();
  showView("home-view");
  loadProducts();
});

// View Switching
// Shows one view at a time by toggling the hidden attribute.
function showView(id) {
  views.forEach(v => {
    v.hidden = v.id !== id;
  });
}

// Navigation Setup
// Handles switching between Home, Browse, Product, and Cart views.
function setupNav() {
  navLinks.forEach(btn => {
    btn.addEventListener("click", () => {
      const viewId = btn.getAttribute("data-view");
      if (viewId) {
        showView(viewId);
        if (viewId === "browse-view") renderBrowse();
        else if (viewId === "cart-view") renderCart();
      }
    });
  });

  // Delegated navigation for buttons inside content
  document.body.addEventListener("click", function (e) {
    const target = e.target;
    const view = target.getAttribute && target.getAttribute("data-view");
    if (view) {
      showView(view);
      if (view === "browse-view") renderBrowse();
      else if (view === "cart-view") renderCart();
    }
  });
}

// About Dialog Setup
// Opens the About modal when the user clicks the About button.
function setupAboutDialog() {
  aboutBtn.addEventListener("click", () => {
    aboutDialog.showModal();
  });
}

// Product Loading
// Fetches product data and initializes filter options + browse view.
async function loadProducts() {
  try {
    const response = await fetch("data-compact.json");
    const data = await response.json();
    products = data;
    buildFilterOptions();
    renderBrowse();
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// Build Filter Options
// Dynamically generates filter checkboxes based on product data.
function buildFilterOptions() {
  const categories = new Set();
  const sizes = new Set();
  const colors = new Set();

  products.forEach(p => {
    categories.add(p.category);
    p.sizes.forEach(s => sizes.add(s));
    p.color.forEach(c => colors.add(c.name));
  });

  // Category filters
  filterCategoryDiv.innerHTML = "";
  categories.forEach(cat => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = cat;
    input.className = "filter-category";
    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + cat));
    filterCategoryDiv.appendChild(label);
  });

  // Size filters
  filterSizeDiv.innerHTML = "";
  sizes.forEach(size => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = size;
    input.className = "filter-size";
    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + size));
    filterSizeDiv.appendChild(label);
  });

  // Color filters
  filterColorDiv.innerHTML = "";
  colors.forEach(color => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = color;
    input.className = "filter-color";
    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + color));
    filterColorDiv.appendChild(label);
  });
}

// Browse View Event Setup
// Handles filter changes, sorting, and clearing filters.
function setupBrowseEvents() {
  genderCheckboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      updateFilterState();
      renderBrowse();
    });
  });

  sortSelect.addEventListener("change", () => {
    renderBrowse();
  });

  clearFiltersBtn.addEventListener("click", () => {
    clearAllFilters();
    renderBrowse();
  });

  filterCategoryDiv.addEventListener("change", () => {
    updateFilterState();
    renderBrowse();
  });

  filterSizeDiv.addEventListener("change", () => {
    updateFilterState();
    renderBrowse();
  });

  filterColorDiv.addEventListener("change", () => {
    updateFilterState();
    renderBrowse();
  });
}

// Clear All Filters
// Resets all filter checkboxes and filter state.
function clearAllFilters() {
  filterState.genders = [];
  filterState.categories = [];
  filterState.sizes = [];
  filterState.colors = [];

  genderCheckboxes.forEach(cb => cb.checked = false);
  filterCategoryDiv.querySelectorAll("input").forEach(cb => cb.checked = false);
  filterSizeDiv.querySelectorAll("input").forEach(cb => cb.checked = false);
  filterColorDiv.querySelectorAll("input").forEach(cb => cb.checked = false);
}

// Update Filter State
// Reads all checked filter inputs and updates filterState.
function updateFilterState() {
  filterState.genders = Array.from(genderCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  filterState.categories = Array.from(filterCategoryDiv.querySelectorAll("input"))
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  filterState.sizes = Array.from(filterSizeDiv.querySelectorAll("input"))
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  filterState.colors = Array.from(filterColorDiv.querySelectorAll("input"))
    .filter(cb => cb.checked)
    .map(cb => cb.value);
}

// Apply Filters
// Returns only products that match all active filters.
function applyFilters(list) {
  return list.filter(p => {
    if (filterState.genders.length > 0 && !filterState.genders.includes(p.gender)) return false;
    if (filterState.categories.length > 0 && !filterState.categories.includes(p.category)) return false;

    if (filterState.sizes.length > 0) {
      const hasSize = p.sizes.some(s => filterState.sizes.includes(s));
      if (!hasSize) return false;
    }

    if (filterState.colors.length > 0) {
      const colorNames = p.color.map(c => c.name);
      const hasColor = colorNames.some(cn => filterState.colors.includes(cn));
      if (!hasColor) return false;
    }

    return true;
  });
}

// Sort Products
// Sorts products alphabetically or by price.
function sortProducts(list) {
  const sortBy = sortSelect.value;
  const copy = list.slice();

  if (sortBy === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "price") copy.sort((a, b) => a.price - b.price);

  return copy;
}

// Render Filter Tags
// Displays active filters as tags above the product grid.
function renderFilterTags() {
  filterTagsDiv.innerHTML = "";

  function addTag(label) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = label;
    filterTagsDiv.appendChild(span);
  }

  filterState.genders.forEach(g => addTag(g));
  filterState.categories.forEach(c => addTag(c));
  filterState.sizes.forEach(s => addTag("Size " + s));
  filterState.colors.forEach(c => addTag(c));
}

// Render Browse View
// Applies filters, sorting, and displays product cards.
function renderBrowse() {
  if (!products || products.length === 0) return;

  updateFilterState();
  const filtered = applyFilters(products);
  const sorted = sortProducts(filtered);

  productsGrid.innerHTML = "";
  renderFilterTags();

  if (sorted.length === 0) {
    noResultsP.hidden = false;
    return;
  } else {
    noResultsP.hidden = true;
  }

  sorted.forEach(p => {
    const card = document.createElement("article");
    card.className = "product-card";

    const thumb = document.createElement("div");
    thumb.className = "thumb placeholder-image";

    const title = document.createElement("h3");
    title.textContent = p.name;

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = "$" + p.price.toFixed(2);

    const meta = document.createElement("p");
    meta.className = "muted small";
    meta.textContent = p.gender + " · " + p.category;

    const viewBtn = document.createElement("button");
    viewBtn.className = "secondary-btn";
    viewBtn.textContent = "View Details";
    viewBtn.addEventListener("click", () => {
      openProduct(p.id);
    });

    const addBtn = document.createElement("button");
    addBtn.className = "primary-btn";
    addBtn.textContent = "Add to Cart";
    addBtn.addEventListener("click", () => {
      addProductToCart(p, 1, p.sizes[0] || "", p.color[0]?.name || "");
    });

    card.appendChild(thumb);
    card.appendChild(title);
    card.appendChild(price);
    card.appendChild(meta);
    card.appendChild(viewBtn);
    card.appendChild(addBtn);

    productsGrid.appendChild(card);
  });
}

// Product View Event Setup
// Handles Add to Cart from the product detail page.
function setupProductEvents() {
  addToCartBtn.addEventListener("click", () => {
    if (!currentProduct) return;

    const qty = parseInt(productQtyInput.value, 10) || 1;
    const selectedSizeBtn = sizeOptionsDiv.querySelector(".pill.active");
    const selectedColorSwatch = colorOptionsDiv.querySelector(".color-swatch.active");

    const size = selectedSizeBtn ? selectedSizeBtn.textContent : (currentProduct.sizes[0] || "");
    const color = selectedColorSwatch ? selectedColorSwatch.getAttribute("data-color") : (currentProduct.color[0]?.name || "");

    addProductToCart(currentProduct, qty, size, color);
    addToCartMsg.hidden = false;
    setTimeout(() => {
      addToCartMsg.hidden = true;
    }, 1500);
  });
}

// Open Product View
// Loads a single product into the product detail view.
function openProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  currentProduct = product;

  showView("product-view");
  renderProductView(product);
}

// Render Product View
// Populates product detail UI with selected product data.
function renderProductView(p) {
  breadcrumbsNav.innerHTML = "";
  const parts = ["Home", capitalize(p.gender), p.category, p.name];
  parts.forEach(text => {
    const span = document.createElement("span");
    span.textContent = text;
    breadcrumbsNav.appendChild(span);
  });

  productTitleEl.textContent = p.name;
  productPriceEl.textContent = "$" + p.price.toFixed(2);
  productDescEl.textContent = p.description;
  productMaterialEl.textContent = "Material: " + p.material;
  productQtyInput.value = 1;

  // Size options
  sizeOptionsDiv.innerHTML = "";
  p.sizes.forEach(size => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pill";
    btn.textContent = size;
    btn.addEventListener("click", () => {
      sizeOptionsDiv.querySelectorAll(".pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
    sizeOptionsDiv.appendChild(btn);
  });
  const firstSize = sizeOptionsDiv.querySelector(".pill");
  if (firstSize) firstSize.classList.add("active");

  // Color options
  colorOptionsDiv.innerHTML = "";
  p.color.forEach(c => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = c.hex;
    swatch.setAttribute("data-color", c.name);
    swatch.title = c.name;
    swatch.addEventListener("click", () => {
      colorOptionsDiv.querySelectorAll(".color-swatch").forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
    });
    colorOptionsDiv.appendChild(swatch);
  });
  const firstColor = colorOptionsDiv.querySelector(".color-swatch");
  if (firstColor) firstColor.classList.add("active");
}

// Cart Event Setup
// Handles shipping changes, checkout, and cart updates.
function setupCartEvents() {
  shipDestinationSelect.addEventListener("change", updateTotals);
  shipMethodRadios.forEach(r => r.addEventListener("change", updateTotals));

  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;
    checkoutMsg.hidden = false;
    setTimeout(() => {
      checkoutMsg.hidden = true;
    }, 2000);
    cart = [];
    updateCartCount();
    renderCart();
    showView("home-view");
  });
}

// Add Product to Cart
// Adds or increments a product in the cart array.
function addProductToCart(product, qty, size, color) {
  const existing = cart.find(
    item => item.id === product.id && item.size === size && item.color === color
  );

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      size: size,
      color: color,
      qty: qty
    });
  }

  updateCartCount();
  if (document.getElementById("cart-view").hidden === false) {
    renderCart();
  }
}

// Update Cart Count
// Updates the cart quantity badge in the header.
function updateCartCount() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountSpan.textContent = totalQty;
}

// Render Cart View
// Displays all cart items and updates totals.
function renderCart() {
  cartBody.innerHTML = "";

  if (cart.length === 0) {
    emptyCartMsg.style.display = "block";
    checkoutBtn.disabled = true;
    shipDestinationSelect.disabled = true;
    shipMethodRadios.forEach(r => r.disabled = true);
  } else {
    emptyCartMsg.style.display = "none";
    checkoutBtn.disabled = false;
    shipDestinationSelect.disabled = false;
    shipMethodRadios.forEach(r => r.disabled = false);
  }

  cart.forEach((item, index) => {
    const tr = document.createElement("tr");

    const tdItem = document.createElement("td");
    tdItem.textContent = item.name;

    const tdColor = document.createElement("td");
    tdColor.textContent = item.color || "-";

    const tdSize = document.createElement("td");
    tdSize.textContent = item.size || "-";

    const tdPrice = document.createElement("td");
    tdPrice.textContent = "$" + item.price.toFixed(2);

    const tdQty = document.createElement("td");
    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.value = item.qty;
    qtyInput.addEventListener("change", () => {
      const newQty = parseInt(qtyInput.value, 10) || 1;
      item.qty = newQty;
      updateCartCount();
      renderCart();
    });
    tdQty.appendChild(qtyInput);

    const tdSubtotal = document.createElement("td");
    tdSubtotal.textContent = "$" + (item.price * item.qty).toFixed(2);

    const tdDelete = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.textContent = "X";
    delBtn.className = "secondary-btn";
    delBtn.addEventListener("click", () => {
      cart.splice(index, 1);
      updateCartCount();
      renderCart();
    });
    tdDelete.appendChild(delBtn);

    tr.appendChild(tdItem);
    tr.appendChild(tdColor);
    tr.appendChild(tdSize);
    tr.appendChild(tdPrice);
    tr.appendChild(tdQty);
    tr.appendChild(tdSubtotal);
    tr.appendChild(tdDelete);

    cartBody.appendChild(tr);
  });

  updateTotals();
}

// Update Totals
// Recalculates merchandise, shipping, tax, and final total.
function updateTotals() {
  const merchTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  let shipping = 0;
  let tax = 0;

  if (merchTotal > 0) {
    const dest = shipDestinationSelect.value;
    let method = "standard";
    shipMethodRadios.forEach(r => {
      if (r.checked) method = r.value;
    });

    if (merchTotal > 500) {
      shipping = 0;
    } else {
      if (method === "standard") {
        if (dest === "CA") shipping = 10;
        else if (dest === "US") shipping = 15;
        else shipping = 20;
      } else if (method === "express") {
        if (dest === "CA") shipping = 25;
        else if (dest === "US") shipping = 25;
        else shipping = 30;
      } else if (method === "priority") {
        if (dest === "CA") shipping = 35;
        else if (dest === "US") shipping = 50;
        else shipping = 50;
      }
    }

    if (dest === "CA") {
      tax = merchTotal * 0.05;
    }
  }

  const finalTotal = merchTotal + shipping + tax;

  totalMerchSpan.textContent = "$" + merchTotal.toFixed(2);
  totalShippingSpan.textContent = "$" + shipping.toFixed(2);
  totalTaxSpan.textContent = "$" + tax.toFixed(2);
  totalFinalSpan.textContent = "$" + finalTotal.toFixed(2);
}

// Helpers
// Small utility functions used across the app.
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}