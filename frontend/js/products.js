// Products State
let products = [];
let categories = [];
let currentPage = 1;
let totalPages = 1;
let filters = {
  search: '',
  category: 'All',
  minPrice: '',
  maxPrice: '',
  sort: 'newest'
};

// Initialize products page
async function initProducts() {
  try {
    await Promise.all([
      loadCategories(),
      loadProducts()
    ]);
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Load categories
async function loadCategories() {
  try {
    const data = await productsAPI.getCategories();
    categories = data.categories;
    renderCategoryFilter();
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

// Render category filter options
function renderCategoryFilter() {
  const select = document.getElementById('categoryFilter');
  select.innerHTML = categories.map(cat => 
    `<option value="${cat}">${cat}</option>`
  ).join('');
}

// Load products with filters
async function loadProducts(page = 1) {
  try {
    showProductsLoading();
    
    const params = {
      page,
      limit: 12,
      ...filters
    };
    
    // Clean up empty params
    if (!params.search) delete params.search;
    if (params.category === 'All') delete params.category;
    if (!params.minPrice) delete params.minPrice;
    if (!params.maxPrice) delete params.maxPrice;
    
    const data = await productsAPI.getAll(params);
    
    products = data.products;
    currentPage = data.currentPage;
    totalPages = data.totalPages;
    
    renderProducts();
    renderPagination();
    updateResultsCount(data.total);
    
  } catch (error) {
    showProductsError(error.message);
  }
}

// Show loading state for products
function showProductsLoading() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
    </div>
  `;
}

// Show error state
function showProductsError(message) {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">⚠️</div>
      <h3>Unable to load products</h3>
      <p>${message}</p>
      <button class="btn btn-primary" onclick="loadProducts()">Try Again</button>
    </div>
  `;
}

// Render products grid
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  
  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search terms</p>
        <button class="btn btn-outline" onclick="clearFilters()">Clear Filters</button>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = products.map(product => `
    <div class="product-card" onclick="showProductDetail('${product._id}')">
      <img src="${product.image}" alt="${product.name}" class="product-image" 
           onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          <div class="product-rating">
            <span class="star">★</span>
            <span>${product.rating.toFixed(1)} (${product.numReviews})</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Render pagination
function renderPagination() {
  const pagination = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let buttons = '';
  
  // Previous button
  buttons += `<button ${currentPage === 1 ? 'disabled' : ''} onclick="loadProducts(${currentPage - 1})">Prev</button>`;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      buttons += `<button class="${i === currentPage ? 'active' : ''}" onclick="loadProducts(${i})">${i}</button>`;
    } else if (
      i === currentPage - 2 ||
      i === currentPage + 2
    ) {
      buttons += `<button disabled>...</button>`;
    }
  }
  
  // Next button
  buttons += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="loadProducts(${currentPage + 1})">Next</button>`;
  
  pagination.innerHTML = buttons;
}

// Update results count
function updateResultsCount(total) {
  const count = document.getElementById('resultsCount');
  count.textContent = `${total} product${total !== 1 ? 's' : ''} found`;
}

// Filter products
function filterProducts() {
  filters = {
    search: document.getElementById('searchInput').value,
    category: document.getElementById('categoryFilter').value,
    minPrice: document.getElementById('minPrice').value,
    maxPrice: document.getElementById('maxPrice').value,
    sort: document.getElementById('sortFilter').value
  };
  
  currentPage = 1;
  loadProducts(1);
}

// Clear filters
function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('categoryFilter').value = 'All';
  document.getElementById('minPrice').value = '';
  document.getElementById('maxPrice').value = '';
  document.getElementById('sortFilter').value = 'newest';
  
  filters = {
    search: '',
    category: 'All',
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  };
  
  currentPage = 1;
  loadProducts(1);
}

// Debounce search
let searchTimeout;
function debounceSearch(event) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filterProducts();
  }, 300);
}

// Show product detail modal
async function showProductDetail(productId) {
  try {
    const modal = document.getElementById('productModal');
    const detail = document.getElementById('productDetail');
    
    modal.classList.add('active');
    detail.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    const data = await productsAPI.getById(productId);
    const product = data.product;
    
    detail.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-detail-image"
           onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">
      <div class="product-detail-info">
        <span class="product-category">${product.category}</span>
        <h2>${product.name}</h2>
        <div class="product-detail-price">$${product.price.toFixed(2)}</div>
        <div class="product-detail-meta">
          <div class="meta-item">
            <span>Rating</span>
            <span>${product.rating.toFixed(1)} ★</span>
          </div>
          <div class="meta-item">
            <span>Reviews</span>
            <span>${product.numReviews}</span>
          </div>
          <div class="meta-item">
            <span>Stock</span>
            <span>${product.stock} units</span>
          </div>
        </div>
        <p class="product-detail-description">${product.description}</p>
        <div class="product-detail-actions">
          <div class="quantity-selector">
            <button class="quantity-btn" onclick="updateDetailQuantity(-1)">-</button>
            <span class="quantity-value" id="detailQuantity">1</span>
            <button class="quantity-btn" onclick="updateDetailQuantity(1)">+</button>
          </div>
          <button class="btn btn-primary" onclick="addToCartFromDetail('${product._id}')">
            Add to Cart
          </button>
        </div>
      </div>
    `;
    
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Close product modal
function closeProductModal() {
  const modal = document.getElementById('productModal');
  modal.classList.remove('active');
}

// Update quantity in detail modal
let detailQuantity = 1;
function updateDetailQuantity(change) {
  const quantityEl = document.getElementById('detailQuantity');
  detailQuantity = Math.max(1, Math.min(99, detailQuantity + change));
  quantityEl.textContent = detailQuantity;
}

// Add to cart from detail modal
async function addToCartFromDetail(productId) {
  try {
    if (!isLoggedIn()) {
      showAuthModal('login');
      showToast('Please login to add items to cart', 'warning');
      return;
    }
    
    await cartAPI.addItem(productId, detailQuantity);
    closeProductModal();
    updateCartCount();
    showToast('Item added to cart!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Load featured products
async function loadFeaturedProducts() {
  try {
    const data = await productsAPI.getFeatured();
    renderFeaturedProducts(data.products);
  } catch (error) {
    console.error('Error loading featured products:', error);
  }
}

// Render featured products
function renderFeaturedProducts(products) {
  const grid = document.getElementById('featuredProducts');
  
  if (products.length === 0) {
    grid.innerHTML = '<p>No featured products available</p>';
    return;
  }
  
  grid.innerHTML = products.slice(0, 4).map(product => `
    <div class="product-card" onclick="showProductDetail('${product._id}')">
      <img src="${product.image}" alt="${product.name}" class="product-image"
           onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          <div class="product-rating">
            <span class="star">★</span>
            <span>${product.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// Seed products (for demo)
async function seedProducts() {
  try {
    showLoading();
    await productsAPI.seed();
    showToast('Sample products added successfully!', 'success');
    loadProducts();
    loadFeaturedProducts();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
}

