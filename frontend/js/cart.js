// Cart State
let cart = [];

// Initialize cart
function initCart() {
  loadCart();
}

// Load cart from server or localStorage
async function loadCart() {
  if (isLoggedIn()) {
    await syncCartWithServer();
  } else {
    loadCartFromLocal();
  }
  updateCartCount();
  updateCartTotal();
}

// Sync local cart with server
async function syncCartWithServer() {
  try {
    const localCart = getLocalCart();
    
    if (localCart.length > 0) {
      // Add local cart items to server
      for (const item of localCart) {
        try {
          await cartAPI.addItem(item.productId, item.quantity);
        } catch (error) {
          console.error('Error syncing item:', error);
        }
      }
      // Clear local cart after sync
      localStorage.removeItem('cart');
    }
    
    // Load cart from server
    await loadCartFromServer();
  } catch (error) {
    console.error('Error syncing cart:', error);
    loadCartFromLocal();
  }
}

// Load cart from server
async function loadCartFromServer() {
  try {
    const data = await cartAPI.getCart();
    cart = data.cart || [];
    renderCartItems();
    updateCartTotal();
  } catch (error) {
    console.error('Error loading cart from server:', error);
    loadCartFromLocal();
  }
}

// Load cart from localStorage
function loadCartFromLocal() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  } else {
    cart = [];
  }
  renderCartItems();
  updateCartTotal();
}

// Get local cart items
function getLocalCart() {
  const savedCart = localStorage.getItem('cart');
  return savedCart ? JSON.parse(savedCart) : [];
}

// Save cart to localStorage
function saveLocalCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Add item to cart
async function addToCart(productId, quantity = 1) {
  try {
    if (!isLoggedIn()) {
      // Add to local cart
      const localCart = getLocalCart();
      const existingItem = localCart.find(item => item.productId === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        localCart.push({ productId, quantity });
      }
      
      localStorage.setItem('cart', JSON.stringify(localCart));
      updateCartCount();
      showToast('Item added to cart!', 'success');
      return;
    }
    
    // Add to server cart
    const data = await cartAPI.addItem(productId, quantity);
    cart = data.cart;
    updateCartCount();
    showToast('Item added to cart!', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Render cart items
function renderCartItems() {
  const container = document.getElementById('cartItems');
  const summary = document.getElementById('cartSummary');
  
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added any items yet</p>
        <button class="btn btn-primary" onclick="showPage('products')">Start Shopping</button>
      </div>
    `;
    summary.style.display = 'none';
    return;
  }
  
  summary.style.display = 'block';
  
  container.innerHTML = cart.map(item => {
    const product = item.product || {};
    const image = product.image || 'https://via.placeholder.com/120x120?text=No+Image';
    const name = product.name || 'Unknown Product';
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    const total = price * quantity;
    
    return `
      <div class="cart-item">
        <img src="${image}" alt="${name}" class="cart-item-image"
             onerror="this.src='https://via.placeholder.com/120x120?text=No+Image'">
        <div class="cart-item-details">
          <h4 class="cart-item-name">${name}</h4>
          <p class="cart-item-price">$${price.toFixed(2)} each</p>
          <div class="cart-item-actions">
            <div class="quantity-control">
              <button class="quantity-btn" onclick="updateCartQuantity('${product._id}', ${quantity - 1})"
                      ${quantity <= 1 ? 'disabled' : ''}>-</button>
              <span class="quantity-value">${quantity}</span>
              <button class="quantity-btn" onclick="updateCartQuantity('${product._id}', ${quantity + 1})">+</button>
            </div>
            <span class="cart-item-total">$${total.toFixed(2)}</span>
            <button class="cart-item-remove" onclick="removeFromCart('${product._id}')">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Update cart item quantity
async function updateCartQuantity(productId, newQuantity) {
  if (newQuantity < 1) return;
  
  try {
    if (!isLoggedIn()) {
      // Update local cart
      const localCart = getLocalCart();
      const item = localCart.find(i => i.productId === productId);
      if (item) {
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(localCart));
        loadCartFromLocal();
      }
      return;
    }
    
    // Update server cart
    const data = await cartAPI.updateQuantity(productId, newQuantity);
    cart = data.cart;
    renderCartItems();
    updateCartTotal();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Remove item from cart
async function removeFromCart(productId) {
  try {
    if (!isLoggedIn()) {
      // Remove from local cart
      let localCart = getLocalCart();
      localCart = localCart.filter(item => item.productId !== productId);
      localStorage.setItem('cart', JSON.stringify(localCart));
      loadCartFromLocal();
      showToast('Item removed from cart', 'success');
      return;
    }
    
    // Remove from server cart
    const data = await cartAPI.removeItem(productId);
    cart = data.cart;
    renderCartItems();
    updateCartCount();
    updateCartTotal();
    showToast('Item removed from cart', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Clear cart
async function clearCart() {
  if (cart.length === 0) {
    showToast('Cart is already empty', 'warning');
    return;
  }
  
  if (!confirm('Are you sure you want to clear your cart?')) {
    return;
  }
  
  try {
    if (!isLoggedIn()) {
      localStorage.removeItem('cart');
      cart = [];
      renderCartItems();
      updateCartCount();
      updateCartTotal();
      showToast('Cart cleared', 'success');
      return;
    }
    
    await cartAPI.clearCart();
    cart = [];
    renderCartItems();
    updateCartCount();
    updateCartTotal();
    showToast('Cart cleared', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Update cart count in header
function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  const count = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  countEl.textContent = count;
}

// Update cart total
function updateCartTotal() {
  const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  const shipping = subtotal > 0 ? 9.99 : 0;
  const total = subtotal + shipping;
  
  const subtotalEl = document.getElementById('cartSubtotal');
  const shippingEl = document.getElementById('cartShipping');
  const totalEl = document.getElementById('cartTotal');
  
  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = shipping > 0 ? `$${shipping.toFixed(2)}` : 'Free';
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// Get cart total for checkout
function getCartTotal() {
  const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  return subtotal;
}

// Proceed to checkout
function proceedToCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty', 'warning');
    return;
  }
  
  if (!requireAuth()) {
    return;
  }
  
  // Populate checkout summary
  renderCheckoutSummary();
  showPage('checkout');
}

// Render checkout summary
function renderCheckoutSummary() {
  const container = document.getElementById('checkoutItems');
  const totalEl = document.getElementById('checkoutTotal');
  
  container.innerHTML = cart.map(item => {
    const product = item.product || {};
    const image = product.image || 'https://via.placeholder.com/60x60?text=No+Image';
    const name = product.name || 'Unknown Product';
    const price = item.price || 0;
    const quantity = item.quantity || 1;
    
    return `
      <div class="review-item">
        <img src="${image}" alt="${name}" class="review-item-image"
             onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
        <div class="review-item-info">
          <div class="review-item-name">${name}</div>
          <div class="review-item-qty">Qty: ${quantity}</div>
        </div>
        <div class="review-item-price">$${(price * quantity).toFixed(2)}</div>
      </div>
    `;
  }).join('');
  
  if (totalEl) {
    totalEl.textContent = `$${getCartTotal().toFixed(2)}`;
  }
}

