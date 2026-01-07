# E-Commerce Store Deployment Guide

## Quick Deploy to Vercel (Frontend) + Render (Backend)

### Deploy Frontend to Vercel

#### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up (free tier works)
2. Sign up using your GitHub account for easy integration

#### Step 2: Connect Your Repository
1. Click "Add New..." → "Project"
2. Select "Import Git Repository"
3. Search for `swathideshmukh/ShopKart` or select it from the list
4. Click "Import"

#### Step 3: Configure Project Settings
In the Vercel configuration screen:
- **Framework Preset**: Other / No Framework
- **Root Directory**: `frontend`
- **Build Command**: Leave empty (not needed for static files)
- **Output Directory**: Leave as default
- **Install Command**: Leave empty

#### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete (~1-2 minutes)
3. You'll get a live URL like: `https://shopkart.vercel.app`

---

### Deploy Backend to Render

#### Step 1: Create Render Account
1. Go to [render.com](https://render.com) and sign up (free tier works)
2. Sign up using your GitHub account

#### Step 2: Create a Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository (`swathideshmukh/ShopKart`)
3. Configure the service:
   - **Name**: shopkart-backend (or your preferred name)
   - **Branch**: main
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

#### Step 3: Configure Environment Variables
In the Render dashboard, go to "Environment" tab and add:

| Variable | Value |
|----------|-------|
| `PORT` | 443 |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate a secure random string |
| `JWT_EXPIRE` | 7d |
| `CORS_ORIGINS` | https://your-vercel-frontend.vercel.app |

**To generate JWT_SECRET:**
```bash
# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Min 0 -Max 255 }))

# Or use an online generator
# https://generate.plus/en/base64
```

#### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete (~2-3 minutes)
3. Your backend will be available at: `https://shopkart-backend.onrender.com`

---

### MongoDB Atlas Setup (Required)

#### Step 1: Create MongoDB Atlas Account
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and sign up

#### Step 2: Create Free Cluster
1. Select "M0" (Free tier)
2. Choose your cloud provider (AWS recommended)
3. Select a region close to your users
4. Click "Create Cluster" (takes 1-3 minutes)

#### Step 3: Create Database User
1. Go to "Database Access" → "Add New Database User"
2. Create username: `shopkart_admin`
3. Create a strong password
4. Save the password somewhere safe!

#### Step 4: Configure Network Access
1. Go to "Network Access" → "Add IP Address"
2. Click "Allow Access from Anywhere" (0.0.0.0/0)
3. This is required for cloud deployments

#### Step 5: Get Connection String
1. Click "Connect" → "Connect your application"
2. Copy the connection string
3. Replace `<password>` with your database user password:
```
mongodb+srv://shopkart_admin:YOUR_PASSWORD@cluster0.xxx.mongodb.net/ecommerce-store?retryWrites=true&w=majority
```

---

### Update Frontend API URL

After deploying the backend, update the frontend to use your backend URL:

1. Go to your GitHub repository
2. Edit `frontend/js/api.js`
3. Change the `API_BASE_URL`:

```javascript
// Before (local development)
const API_BASE_URL = 'http://localhost:5000/api';

// After (production)
const API_BASE_URL = 'https://shopkart-backend.onrender.com/api';
```

4. Commit and push the changes
5. Vercel will automatically redeploy

---

### Complete Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables configured in Render
- [ ] CORS origins configured for production frontend
- [ ] Frontend API URL updated to production backend URL
- [ ] Tested the full flow:
  - [ ] Browse products
  - [ ] Add items to cart
  - [ ] Register/Login
  - [ ] Place an order

---

### Troubleshooting

#### Frontend Issues

**CORS Errors:**
- Ensure `CORS_ORIGINS` in Render includes your Vercel frontend URL
- Format: `https://your-project.vercel.app` (no trailing slash)

**API Not Loading:**
- Check browser console for errors
- Verify API URL in `frontend/js/api.js`
- Ensure backend is deployed and running

#### Backend Issues

**MongoDB Connection Failed:**
- Verify `MONGODB_URI` is correct
- Check IP whitelist in MongoDB Atlas (0.0.0.0/0)
- Ensure database user credentials are correct

**JWT Errors:**
- Verify `JWT_SECRET` is set in Render
- Generate a new secret if needed

**Build Failed:**
- Check Render build logs
- Ensure `package.json` has correct dependencies
- Verify Node.js version compatibility

---

### Alternative Deployment Options

#### Railway (All-in-One)
1. Deploy `backend/` as one service
2. Deploy `frontend/` as another service
3. Use Railway's MongoDB plugin for database

#### Heroku (Backend) + Vercel (Frontend)
```bash
# Install Heroku CLI
npm install -g heroku

# Deploy backend
cd backend
heroku create shopkart-api
heroku config:set MONGODB_URI="your_connection_string"
heroku config:set JWT_SECRET="your_secret"
git push heroku main
```

#### Docker Deployment
Create `backend/Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

Deploy with Docker Compose or your preferred container service.

---

### Useful Commands

```bash
# View logs on Render
# Go to Render Dashboard → Your Service → Logs

# Restart backend on Render
# Go to Render Dashboard → Your Service → Actions → Restart

# Test backend API
curl https://shopkart-backend.onrender.com/api/health

# Generate secure JWT secret (Windows PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Min 0 -Max 255 }))
```

---

### Support

- **Vercel Documentation**: https://vercel.com/docs
- **Render Documentation**: https://render.com/docs
- **MongoDB Atlas Documentation**: https://docs.atlas.mongodb.com
- **GitHub Repository**: https://github.com/swathideshmukh/ShopKart

