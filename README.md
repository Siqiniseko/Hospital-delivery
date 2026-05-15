# MedRoute Level 3 — Hospital Delivery System

A company-style starter project for hospital pill delivery.

## Features
- React patient, driver, and admin portals
- Node.js + Express backend
- MongoDB models for users, appointments, pill orders, deliveries, inventory
- JWT authentication and role-based access
- Live Uber-style driver tracking with Socket.io
- Leaflet maps for patient tracking and admin control room
- Docker Compose setup
- Seed users and inventory

## Run
```bash
docker compose up
```

Seed the database:
```bash
docker compose exec backend npm run seed
```

Open:
- Frontend: http://localhost:3000
- Backend health: http://localhost:5000/health

## Demo users
Password for all: `Password123!`

- Admin: `admin@hospital.com`
- Driver: `driver@hospital.com`
- Patient: `patient@hospital.com`

## Real-time demo
1. Open `/driver`
2. Start live delivery with ID `demo-delivery`
3. Open `/track/demo-delivery`
4. Open `/admin`

## Important
This is production-style starter code, not a legally certified medical system. Before real use, complete security, privacy, compliance, and clinical safety reviews.
