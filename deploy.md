# Deployment Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Backend Requirements

Make sure your backend server is running on `http://localhost:8080` with the following endpoints:

### Authentication
- `POST /api/auth/signup`
- `POST /api/auth/signin`

### Admin Endpoints
- `GET /api/admin/employees`
- `DELETE /api/admin/user/{id}`
- `GET /api/admin/expenses`
- `POST /api/admin/expenses`
- `GET /api/admin/expenses/monthly`
- `GET /api/admin/expenses/yearly`

### User Endpoints
- `GET /api/users`

## Environment Configuration

Create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your web server

3. **Configure your web server** to serve the React app for all routes (SPA routing)

## Features Included

✅ **Modern React Architecture**
- Context API for state management
- Custom hooks for authentication
- Component-based architecture
- Responsive design with Tailwind CSS

✅ **Authentication System**
- JWT-based authentication
- Role-based access control
- Protected routes
- Automatic token validation

✅ **Admin Dashboard**
- Employee management (CRUD operations)
- Expense tracking and analytics
- Real-time data visualization
- Responsive tables and forms

✅ **User Dashboard**
- Team contacts directory
- Profile management
- Activity tracking
- Mobile-optimized interface

✅ **Modern UI Components**
- Reusable component library
- Loading states and error handling
- Toast notifications
- Modal dialogs
- Responsive tables

✅ **Mobile Support**
- Mobile-first design
- Collapsible navigation
- Touch-friendly interface
- Responsive layouts

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized bundle size with Vite
- Lazy loading ready
- Efficient re-renders
- Mobile performance optimized
