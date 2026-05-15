# Hospital Delivery Deployment

This project deploys as two services:

- Frontend: Vite React app in `frontend`
- Backend API: Express app in `backend`
- Database: MongoDB Atlas

## 1. Create The Database

Create a free MongoDB Atlas cluster, then copy the connection string. It will look like:

```text
mongodb+srv://USER:PASSWORD@cluster-name.mongodb.net/hospital_delivery_level3
```

## 2. Deploy The Backend On Render

Create a new Render Web Service from this repository.

Use these settings:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
Health Check Path: /health
```

Add these environment variables:

```text
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=a_long_random_secret
CLIENT_URL=https://your-frontend-domain.vercel.app
NODE_ENV=production
```

After the backend is live, run the seed command once from Render Shell:

```bash
npm run seed
```

## 3. Deploy The Frontend On Vercel

Create a Vercel project using the `frontend` folder.

Use these settings:

```text
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Add these environment variables:

```text
VITE_API_URL=https://your-render-api.onrender.com/api
VITE_OSM_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

## 4. Connect CORS

Copy your final Vercel domain and set it as `CLIENT_URL` in Render.
Then redeploy the backend.

## Demo Logins

After seeding:

```text
admin@hospital.com / Password123!
doctor@hospital.com / Password123!
driver@hospital.com / Password123!
patient@hospital.com / Password123!
```
