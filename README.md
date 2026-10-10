# E-Commerce Product Management System

Full-stack e-commerce product and order management application built with Node.js, Express, MongoDB/Mongoose and React/Vite.

## Features
- User/admin authentication with JWT and bcrypt
- Product CRUD for admins
- Product search, category and price filtering
- Pagination
- Product details
- User cart and checkout
- Server-side order total and price validation
- Stock validation and transactional stock updates
- User order history
- Admin order management and status workflow
- Responsive frontend

## Local setup

### Backend
1. Copy `.env.example` to `.env`.
2. Set `MONGO_URI` and `JWT_SECRET`.
3. Run `npm install`.
4. Run `npm start`.

### Frontend
1. Copy `frontend/.env.example` to `frontend/.env`.
2. Set `VITE_API_URL` to the backend URL.
3. Run `npm install` inside `frontend`.
4. Run `npm run dev`.

## Deployment
For Render, deploy the backend as a Node web service and the frontend as a static site. Vite environment variables must be configured in the frontend service before building.
