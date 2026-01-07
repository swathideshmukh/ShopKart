// Main Application

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// Main initialization
async function initApp() {
  initAuth();
  initCart();
  await loadFeaturedProducts();
  
  // Show home page by default
  showPage('home');
  
  // Load products if on products page
  const productsPage = document.getElementById('productsPage');
  if (productsPage.classList.contains('active')) {
    await initProducts();
  }
}

// Show page
function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Show target page
  const page = document.getElementById(pageName + 'Page');
  if (page) {
    page.classList.add('active');
  }
  
  // Update nav active state
  const navLink = document.querySelector(`.nav-link[onclick="showPage('${pageName}')"]`);
  if (navLink) {
    navLink.classList.add('active');
  }
  
  // Initialize page-specific content
  switch (pageName) {
    case 'products':
      initProducts();
      break;
    case 'cart':
      // Cart is already initialized
      break;
    case 'orders':
      if (isLoggedIn()) {
        loadOrders();
      } else {
        showAuthModal('login');
        showToast('Please login to view orders', 'warning');
        showPage('home');
      }
      break;
    case 'checkout':
      if (cart.length === 0) {
        showPage('cart');
        showToast('Your cart is empty', 'warning');
      }
      break;
  }
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// Load featured products for home page
async function loadFeaturedProducts() {
  try {
    const data = await productsAPI.getFeatured();
    renderFeaturedProducts(data.products);
  } catch (error) {
    console.error('Error loading featured products:', error);
    // Seed products if none exist
    try {
      await productsAPI.seed();
      const seededData = await productsAPI.getFeatured();
      renderFeaturedProducts(seededData.products);
    } catch (seedError) {
      console.error('Error seeding products:', seedError);
    }
  }
}

// Render featured products
function renderFeaturedProducts(products) {
  const grid = document.getElementById('featuredProducts');
  
  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3>No products yet</h3>
        <p>Click below to add sample products</p>
        <button class="btn btn-primary" onclick="seedProducts()">Add Sample Products</button>
      </div>
    `;
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

// Load orders
async function loadOrders() {
  const container = document.getElementById('ordersList');
  
  try {
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    const data = await ordersAPI.getOrders();
    
    if (data.orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>No orders yet</h3>
          <p>When you place an order, it will appear here</p>
          <button class="btn btn-primary" onclick="showPage('products')">Start Shopping</button>
        </div>
      `;
      return;
    }
    
    container.innerHTML = data.orders.map(order => renderOrderCard(order)).join('');
    
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Unable to load orders</h3>
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="loadOrders()">Try Again</button>
      </div>
    `;
  }
}

// Render order card
function renderOrderCard(order) {
  const statusClass = order.status || 'pending';
  const statusText = order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending';
  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `
    <div class="order-card">
      <div class="order-header">
        <div class="order-info">
          <h3>Order #${order._id.slice(-8).toUpperCase()}</h3>
          <span>Placed on ${date}</span>
        </div>
        <span class="order-status ${statusClass}">${statusText}</span>
      </div>
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <img src="${item.product?.image || 'https://via.placeholder.com/60x60?text=No+Image'}" 
                 alt="${item.name}" class="order-item-image"
                 onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
            <div class="order-item-info">
              <div class="order-item-name">${item.name}</div>
              <div class="order-item-details">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="order-footer">
        <span class="order-total">Total: $${order.totalAmount.toFixed(2)}</span>
      </div>
    </div>
  `;
}

// Place order
async function placeOrder(event) {
  event.preventDefault();
  
  if (cart.length === 0) {
    showToast('Your cart is empty', 'warning');
    showPage('cart');
    return;
  }
  
  if (!isLoggedIn()) {
    showAuthModal('login');
    showToast('Please login to place an order', 'warning');
    return;
  }
  
  try {
    showLoading();
    
    const orderData = {
      shippingAddress: {
        address: document.getElementById('shippingAddress').value,
        city: document.getElementById('shippingCity').value,
        postalCode: document.getElementById('shippingPostalCode').value,
        country: document.getElementById('shippingCountry').value
      },
      paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
      notes: document.getElementById('orderNotes').value
    };
    
    const data = await ordersAPI.createOrder(orderData);
    
    // Show confirmation
    document.getElementById('orderNumber').textContent = data.order._id.slice(-8).toUpperCase();
    showPage('confirmation');
    
    // Clear cart from UI
    cart = [];
    updateCartCount();
    
    showToast('Order placed successfully!', 'success');
    
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Show loading overlay
function showLoading() {
  const existing = document.querySelector('.loading-overlay');
  if (existing) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.innerHTML = '<div class="spinner"></div>';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  
  document.body.appendChild(overlay);
}

// Hide loading overlay
function hideLoading() {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) {
    overlay.remove();
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠'}</span>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }
});

// Seed products (for demo)
async function seedProducts() {
  try {
    showLoading();
    await productsAPI.seed();
    showToast('Sample products added successfully!', 'success');
    await loadFeaturedProducts();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Export for testing
window.App = {
  showPage,
  loadOrders,
  placeOrder,
  seedProducts
};

