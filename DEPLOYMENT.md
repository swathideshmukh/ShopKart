# Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Frontend) + Render (Backend)

#### Deploy Backend to Render

1. **Create a Render Account**
   - Go to [render.com](https://render.com) and sign up (free tier works)

2. **Create a Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Set build command: `cd backend && npm install`
   - Set start command: `cd backend && node server.js`

3. **Configure Environment Variables**
   In Render Dashboard, add these environment variables:
   ```
   PORT=443
   MONGODB_URI=mongodb+srv://<your_connection_string>
   JWT_SECRET=<generate_a_secure_random_string>
   JWT_EXPIRE=7d
   ```

4. **Get Your MongoDB Connection String**
   - Use [MongoDB Atlas](https://www.mongodb.com/atlas/database) (free tier)
   - Create a cluster, database, and user
   - Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/ecommerce-store?retryWrites=true&w=majority`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Your backend will be available at `https://your-service-name.onrender.com`

#### Deploy Frontend to Vercel

1. **Create a Vercel Account**
   - Go to [vercel.com](https://vercel.com) and sign up

2. **Create a New Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Set root directory to `frontend`
   - Set output directory as default

3. **Deploy**
   - Click "Deploy"
   - Your frontend will be available at `https://your-project.vercel.app`

4. **Update API Base URL**
   - Edit `frontend/js/api.js`
   - Change `BASE_URL` to your Render backend URL:
   ```javascript
   const BASE_URL = 'https://your-backend-service.onrender.com/api';
   ```

---

### Option 2: Railway (All-in-One)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app) and sign up

2. **Deploy Backend**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository
   - Set root directory to `backend`
   - Add environment variables in Railway dashboard:
     ```
     PORT=8080
     MONGODB_URI=<your_mongodb_atlas_connection_string>
     JWT_SECRET=<secure_random_string>
     JWT_EXPIRE=7d
     ```

3. **Deploy Frontend**
   - Click "New Project" again
   - Select "Deploy from GitHub repo"
   - Set root directory to `frontend`
   - Deploy

4. **Update Frontend API URL**
   - Edit `frontend/js/api.js` with your Railway backend URL

---

### Option 3: Heroku (Backend) + Netlify (Frontend)

#### Heroku Backend Deployment

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_connection_string"
   heroku config:set JWT_SECRET="your_secure_secret"
   heroku config:set JWT_EXPIRE="7d"
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

#### Netlify Frontend Deployment

1. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repository
   - Set build command: `echo "No build needed"`
   - Set publish directory: `frontend`

2. **Update API URL**
   - Edit `frontend/js/api.js` with your Heroku app URL

---

### Option 4: Docker Deployment

1. **Create Dockerfile in backend folder**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install --production
   COPY . .
   EXPOSE 5000
   CMD ["node", "server.js"]
   ```

2. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     backend:
       build: ./backend
       ports:
         - "5000:5000"
       environment:
         - PORT=5000
         - MONGODB_URI=mongodb://mongo:27017/ecommerce
         - JWT_SECRET=your_secret_here
         - JWT_EXPIRE=7d
       depends_on:
         - mongo
     
     mongo:
       image: mongo:latest
       ports:
         - "27017:27017"
       volumes:
         - mongo-data:/data/db

   volumes:
     mongo-data:
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

---

## MongoDB Atlas Setup (Required for All Deployments)

1. **Create MongoDB Atlas Account**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Click "Try Free" and sign up

2. **Create Free Cluster**
   - Select "M0" (Free tier)
   - Choose your cloud provider (AWS/Google/Azure)
   - Create cluster (takes 1-3 minutes)

3. **Create Database User**
   - Go to "Database Access" → "Add New Database User"
   - Create username/password
   - Save credentials!

4. **Configure Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development

5. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   ```bash
   mongodb+srv://username:password@cluster0.xxx.mongodb.net/ecommerce-store?retryWrites=true&w=majority
   ```

---

## Production Checklist

- [ ] Use a secure JWT_SECRET (generate with `openssl rand -hex 32`)
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up logging and monitoring
- [ ] Use environment variables for all secrets
- [ ] Test thoroughly before going live

---

## Useful Commands

```bash
# Generate secure JWT secret
openssl rand -hex 32

# Check logs on Heroku
heroku logs --tail

# Restart Heroku app
heroku restart

# View environment variables on Render
render env list
```

