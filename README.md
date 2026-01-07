# E-Commerce Store

A simplified online store with user authentication, product browsing, shopping cart, and checkout functionality.

## Features

- **User Authentication**: Sign up, login, and JWT-based authentication
- **Product Management**: Browse products with filtering and search
- **Shopping Cart**: Add/remove items, update quantities
- **Checkout Process**: Complete orders with shipping and payment info
- **Order History**: View past orders and their status

## Tech Stack

- **Backend**: Express.js, MongoDB (Mongoose)
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Custom CSS with responsive design

## Project Structure

```
ecommerce-store/
├── backend/
│   ├── models/
│   │   ├── User.js         # User model with cart
│   │   ├── Product.js      # Product model
│   │   └── Order.js        # Order model
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── products.js     # Product API routes
│   │   ├── cart.js         # Cart management routes
│   │   └── orders.js       # Order management routes
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── server.js           # Express server
│   └── .env                # Environment variables
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── style.css       # Styles
│   └── js/
│       ├── api.js          # API helper functions
│       ├── auth.js         # Authentication logic
│       ├── products.js     # Product display logic
│       ├── cart.js         # Cart management
│       └── app.js          # Main application
├── start-backend.bat       # Windows batch file to start backend
└── start-frontend.bat      # Windows batch file for frontend
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas connection)

### Installation

1. **Install MongoDB**
   - Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud)

2. **Install Dependencies**

   ```bash
   cd ecommerce-store
   npm install
   ```

3. **Configure Environment Variables**

   Edit `backend/.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce-store
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB**
   - If using local MongoDB, make sure it's running:
   ```
   mongod
   ```

5. **Start the Backend**

   Option 1 - Double-click `start-backend.bat` in the ecommerce-store folder
   
   Option 2 - Manual:
   ```bash
   cd ecommerce-store/backend
   node server.js
   ```
   
   The server will run on `http://localhost:5000`

6. **Start the Frontend**

   Option 1 - Double-click `start-frontend.bat` to open index.html
   
   Option 2 - Use a static file server:
   ```bash
   cd ecommerce-store/frontend
   npx serve
   ```
   
   Option 3 - Use VS Code Live Server extension:
   - Open `frontend/index.html`
   - Right-click and select "Open with Live Server"

7. **Open the Application**
   
   Navigate to `http://localhost:3000` (or the port shown by your static server)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - Get all categories
- `GET /api/products/featured` - Get featured products
- `POST /api/products/seed` - Seed sample products

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update quantity
- `DELETE /api/cart/:productId` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Place order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details

## Usage

1. **First Visit**: The app will automatically seed sample products on first load
2. **Browse Products**: Click on products to view details
3. **Add to Cart**: Click "Add to Cart" on any product
4. **Login/Register**: Create an account to checkout
5. **Checkout**: Fill in shipping info and place your order
6. **View Orders**: Check your order history

## Sample Data

The app includes 12 sample products across categories:
- Electronics (headphones, smartwatch, power bank, gaming mouse)
- Clothing (t-shirt, leather wallet)
- Sports (running shoes, yoga mat)
- Home (desk lamp, plant pots)
- Books (JavaScript and Python programming)

## Demo Accounts

No demo accounts are pre-created. Simply register a new account to start shopping.

## Notes

- Cart is persisted in database for logged-in users
- LocalStorage is used for cart when not logged in
- Stock is automatically updated when orders are placed
- Orders start with "pending" status

