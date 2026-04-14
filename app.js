// Global State
let products = [];
let cart = [];
let currentProduct = null;

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}


// DOM References
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
const filterState = {
  genders: [],
  categories: [],
  sizes: [],
  colors: []
};

// Simple persistence (optional but safe)
function saveCart() {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch {}
}

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem("cart");
    if (raw) {
      cart = JSON.parse(raw);
      updateCartCount();
    }
  } catch {}
}

// Initialization
window.addEventListener("DOMContentLoaded", () => {
  setupNav();
  setupAboutDialog();
  setupBrowseEvents();
  setupProductEvents();
  setupCartEvents();
  loadCartFromStorage();
  showView("home-view");
  loadProducts();
});

// View Switching
function showView(id) {
  views.forEach(v => {
    v.hidden = v.id !== id;
  });
}

// Navigation Setup
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

// About Dialog
function setupAboutDialog() {
  aboutBtn.addEventListener("click", () => {
    aboutDialog.showModal();
  });
}

// Product Loading
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
function buildFilterOptions() {
  const categories = new Set();
  const sizes = new Set();
  const colors = new Set();

  products.forEach(p => {
    categories.add(p.category);
    p.sizes.forEach(s => sizes.add(s));
    p.color.forEach(c => colors.add(c.name));
  });

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

// Browse Events
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

// Clear Filters
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
function sortProducts(list) {
  const sortBy = sortSelect.value;
  const copy = list.slice();

  if (sortBy === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "price") copy.sort((a, b) => a.price - b.price);

  return copy;
}

// Filter Tags
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

// Render Browse
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

// Product Events
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

// Open Product
function openProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  currentProduct = product;

  showView("product-view");
  renderProductView(product);
}

// Render Product View
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

// Cart Events
function setupCartEvents() {
  shipDestinationSelect.addEventListener("change", updateTotals);
  Array.from(shipMethodRadios).forEach(r => r.addEventListener("change", updateTotals));

  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) return;

    checkoutMsg.hidden = false;

    cart = [];
    updateCartCount();
    saveCart();
    renderCart();

    setTimeout(() => {
      checkoutMsg.hidden = true;
      showView("home-view");
    }, 1800);
  });
}

// Add to Cart
function addProductToCart(product, qty, size, colorName) {
  const colorObj = product.color.find(c => c.name === colorName);

  const existing = cart.find(
    item => item.id === product.id && item.size === size && item.color === colorName
  );

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      size: size,
      color: colorName,
      colorHex: colorObj ? colorObj.hex : "#000000",
      qty: qty
    });
  }

  updateCartCount();
  saveCart();
  if (!document.getElementById("cart-view").hidden) renderCart();
}


// Cart Count
function updateCartCount() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountSpan.textContent = totalQty;
}

// Render Cart
function renderCart() {
  cartBody.innerHTML = "";

  if (cart.length === 0) {
    emptyCartMsg.hidden = false;
    updateTotals();
    return;
  }

  emptyCartMsg.hidden = true;

  cart.forEach((item, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <div class="cart-item-image"></div>
      </td>

      <td>${item.name}</td>

      <td>
      <div class="color-swatch"
      style="background:${item.colorHex}; width:18px; height:18px; border-radius:50%;">
      </div>
      </td>


      <td>${item.size}</td>

      <td>$${item.price.toFixed(2)}</td>

      <td>
        <input 
          type="number" 
          class="qty-input" 
          min="1" 
          value="${item.qty}" 
          data-index="${index}"
        >
      </td>

      <td>$${(item.price * item.qty).toFixed(2)}</td>

      <td>
        <button class="link-btn remove-btn" data-index="${index}">
          Remove
        </button>
      </td>
    `;

    cartBody.appendChild(row);
  });

  // Qty change
  document.querySelectorAll(".qty-input").forEach(input => {
    input.addEventListener("change", (e) => {
      const target = e.currentTarget;
      const i = parseInt(target.dataset.index, 10);
      const newQty = parseInt(target.value, 10);

      if (newQty > 0) {
        cart[i].qty = newQty;
      } else {
        cart[i].qty = 1;
        target.value = 1;
      }

      updateCartCount();
      saveCart();
      renderCart();
    });
  });

  // Remove
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const button = e.currentTarget;
      const i = parseInt(button.dataset.index, 10);
      cart.splice(i, 1);
      updateCartCount();
      saveCart();
      renderCart();
    });
  });

  updateTotals();
}

// Totals
function updateTotals() {
  const merchTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  let shipping = 0;
  let tax = 0;

  if (merchTotal > 0) {
    const dest = shipDestinationSelect.value;
    let method = "standard";

    Array.from(shipMethodRadios).forEach(r => {
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
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
