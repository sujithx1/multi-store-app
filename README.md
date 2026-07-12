# StockFlow - Multi-Store Stock Management System

A clean and lightweight web application built for retail inventory tracking and stock distribution across store locations.

## Tech Stack
- **Frontend**: React, TypeScript, TanStack Query, TailwindCSS, Axios
- **Backend**: Node.js, Express, MongoDB (Mongoose), Zod validation

## Getting Started

### 1. Requirements
Ensure you have Node.js and MongoDB installed on your system.

### 2. Backend Installation & Start
```bash
# Navigate to the backend directory
cd backend

# Install project dependencies
npm install

# Set up environment variables
# Create a .env file with your PORT and MONGO_URI
PORT=5000
MONGO_URI=mongodb://localhost:27017/stockflow

# Start the development server
npm run dev
```

### 3. Frontend Installation & Start
```bash
# Navigate to the frontend directory
cd frontend

# Install project dependencies
npm install

# Start the Vite development server
npm run dev
```

## Features
- **Product Catalog**: Add, update, delete, and search products with backend pagination support.
- **Store Locations**: Add, update, and remove store locations.
- **Stock Management**: Initialize stock mappings, adjust quantities (increase/decrease levels), and transfer stock securely between locations.
