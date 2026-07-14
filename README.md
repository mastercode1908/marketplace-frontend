# MegaMart Online Marketplace

## System Overview
**MegaMart** is a robust, modern e-commerce platform designed with a Monolithic (specifically, Modular Monolith) architecture following the Client-Server model. 
It connects buyers and sellers, providing advanced features beyond traditional marketplaces.

- **Architecture:** Modular Monolith (Client-Server).
- **Core Features:** Multi-platform support, comprehensive shopping cart and checkout flows, order management, financial reporting, an integrated AI-powered shopping assistant (RAG Chatbot), and real-time bidirectional communication via WebSockets.
- **Technology Stack:**
  - **Frontend:** React 19 + Vite + Tailwind CSS.
  - **Backend:** Spring Boot 3 + Java 17 + Spring Security (JWT).
  - **Databases:** MySQL (Core System) + PostgreSQL/pgvector (AI Chatbot Engine).

---

## MegaMart Frontend Application

This repository contains the client-side Web Application for the MegaMart platform. It delivers a highly responsive, intuitive, and dynamic user interface catering to all user types: Customers (Buyers), Store Owners (Sellers), and System Administrators.

### UI/UX Architecture & Structure

The application is built as a **Single Page Application (SPA)** utilizing the latest **React 19** features, bundled with **Vite** for lightning-fast Hot Module Replacement (HMR) and optimized production builds. 
The UI relies heavily on **Tailwind CSS** for utility-first styling, complemented by headless UI components from **Radix UI (shadcn/ui)** and complex data grids/components from **Ant Design**.

The source code (`src/`) is strictly organized to promote reusability and separation of concerns:

- **`pages/`**: Contains the main view components, logically grouped by routing boundaries and user roles:
  - `Admin/`: The control center for administrators (User Moderation, Product Approval, Global Analytics).
  - `Seller/`: The merchant dashboard (Inventory Management, Order Fulfillment, Revenue Analytics, Promotion Creation).
  - `User/` (Buyer): Personal profiles, Order histories, and settings.
  - `Catalog/`: The shopping experience (Browsing categories, Searching, Product Details).
  - `Order/`: The transactional flow (Shopping Cart management and multi-step Checkout).
  - `auth/`: Screens for Login, Registration, and Password Recovery.
- **`components/`**: Reusable UI blocks (Buttons, Modals, Navbars, Footers, Product Cards) shared across multiple pages.
- **`services/` & `api/`**: Centralized logic for external communication. This includes Axios interceptors for REST API calls (attaching JWT tokens automatically) and STOMP/SockJS configurations for WebSocket connections.
- **`store/`**: Configuration for **Redux Toolkit**. Manages global state such as the active User session, Shopping Cart contents, and UI themes.
- **`hooks/`**: Custom React hooks encapsulating reusable component logic.
- **`utils/`**: Helper functions for currency formatting, date parsing, and validation.

### Execution Workflow

1. **Routing & Authorization:** Managed by `react-router-dom`. When a user navigates to a protected route (e.g., `/seller/dashboard`), a Higher-Order Component or Hook verifies the presence and validity of the JWT token in LocalStorage/Redux. Unauthenticated users are seamlessly redirected to `/login`.
2. **State Management:** Critical data is lifted to the Redux Store. This ensures that when a user adds an item to their cart on the Catalog page, the Cart icon in the Header updates instantly without unnecessary API calls.
3. **Data Fetching:** Pages trigger asynchronous API calls via the `services` layer upon mounting (often using `useEffect` or data loaders). The fetched JSON is then parsed and rendered into the UI grid or saved to Redux.
4. **Real-time Synchronization:** Upon successful login, the application establishes a secure WebSocket connection to the Backend. This enables the RAG Chatbot interface to stream responses and allows the system to push instant notifications (e.g., "New Order Received") directly to the user's screen.

### Comprehensive Setup & Installation

#### Prerequisites
- **Node.js** (v18.0.0 or higher is strictly recommended).
- **npm** (comes with Node.js) or **Yarn** package manager.
- A running instance of the MegaMart Backend server (usually on `localhost:8080`).

#### 1. Environment Configuration
Create a `.env` file in the root directory of the frontend project (next to `package.json`). Configure the endpoints to point to your backend services:

```env
# REST API Base URL
VITE_API_BASE_URL=http://localhost:8080/api

# WebSocket Endpoint for STOMP
VITE_WEBSOCKET_URL=http://localhost:8080/ws
```
*(If your backend is hosted remotely, update these URLs accordingly).*

#### 2. Install Dependencies
Open a terminal in the root directory and run:
```bash
npm install
```
This will read `package.json` and install all required libraries (React, Vite, Tailwind, Redux, etc.) into the `node_modules` folder.

#### 3. Run Development Server
To start the application with Hot-Reload enabled for active development:
```bash
npm run dev
```
Vite will instantly boot the server. Open your browser and navigate to the provided URL (typically `http://localhost:5173`).

#### 4. Production Build
When ready to deploy (e.g., to Vercel, Netlify, or an Nginx server), generate the optimized, minified bundle:
```bash
npm run build
```
The compiled assets will be placed in the `dist/` directory, ready to be served statically.
