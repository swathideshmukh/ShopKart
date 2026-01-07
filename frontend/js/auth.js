// Authentication State
let currentUser = null;

// Initialize authentication
function initAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (token && user) {
    currentUser = JSON.parse(user);
    updateAuthUI(true);
    updateCartCount();
  } else {
    updateAuthUI(false);
  }
}

// Update UI based on auth state
function updateAuthUI(isLoggedIn) {
  const authButtons = document.getElementById('authButtons');
  const userMenu = document.getElementById('userMenu');
  const userName = document.getElementById('userName');
  const ordersLink = document.querySelector('.orders-link');
  
  if (isLoggedIn) {
    authButtons.style.display = 'none';
    userMenu.style.display = 'flex';
    userName.textContent = currentUser?.name || 'User';
    ordersLink.style.display = 'inline-block';
  } else {
    authButtons.style.display = 'flex';
    userMenu.style.display = 'none';
    ordersLink.style.display = 'none';
  }
}

// Show auth modal
function showAuthModal(type = 'login') {
  const modal = document.getElementById('authModal');
  modal.classList.add('active');
  switchAuthTab(type);
}

// Close auth modal
function closeAuthModal() {
  const modal = document.getElementById('authModal');
  modal.classList.remove('active');
  // Reset forms
  document.getElementById('loginForm').reset();
  document.getElementById('registerForm').reset();
}

// Switch between login and register tabs
function switchAuthTab(tab) {
  const loginTab = document.querySelector('.auth-tab:nth-child(1)');
  const registerTab = document.querySelector('.auth-tab:nth-child(2)');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  if (tab === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  } else {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  }
}

// Handle login
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    showLoading();
    const data = await authAPI.login({ email, password });
    
    // Save token and user
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    
    updateAuthUI(true);
    closeAuthModal();
    showToast('Welcome back! Login successful.', 'success');
    
    // Sync local cart with server
    await syncCartWithServer();
    updateCartCount();
    
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Handle register
async function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  
  // Validate passwords match
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }
  
  try {
    showLoading();
    const data = await authAPI.register({ name, email, password });
    
    // Save token and user
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    
    updateAuthUI(true);
    closeAuthModal();
    showToast('Account created successfully! Welcome!', 'success');
    
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    hideLoading();
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  
  updateAuthUI(false);
  updateCartCount();
  showPage('home');
  showToast('You have been logged out.', 'success');
}

// Check if user is logged in
function isLoggedIn() {
  return !!localStorage.getItem('token');
}

// Require authentication for actions
function requireAuth(action) {
  if (!isLoggedIn()) {
    showAuthModal('login');
    showToast('Please login to continue', 'warning');
    return false;
  }
  return true;
}

