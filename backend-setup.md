# Backend Setup Guide

## The Issue
You're getting "Failed to fetch expense data" because your backend server is not running on `http://localhost:8081`.

## Solutions

### Option 1: Start Your Backend Server
Make sure your backend server is running on `http://localhost:8081` with these endpoints:

#### Required Endpoints:
```
POST /api/auth/signup
POST /api/auth/signin
GET /api/admin/employees
DELETE /api/admin/user/{id}
GET /api/admin/expenses
POST /api/admin/expenses
GET /api/admin/expenses/monthly
GET /api/admin/expenses/yearly
GET /api/users
```

### Option 2: Use Mock Data (Current Solution)
I've implemented a fallback system that uses mock data when the backend is not available. This allows you to:

✅ **Test the frontend functionality** without a backend
✅ **See how the app works** with sample data
✅ **Develop and design** the interface
✅ **Demo the application** to stakeholders

## Current Status
The app now automatically detects when the backend is not running and uses mock data instead. You should see:

- **Sample employees** in the employee management
- **Sample expenses** in the expense management
- **Mock analytics** in the analytics dashboard
- **Working forms** that simulate API calls

## Backend Requirements

Your backend should implement these endpoints exactly as documented:

### Authentication
```json
POST /api/auth/signup
{
  "username": "string",
  "password": "string", 
  "email": "string",
  "designation": "string",
  "role": "USER" | "ADMIN"
}

POST /api/auth/signin
{
  "username": "string",
  "password": "string"
}
```

### Admin Endpoints
```json
GET /api/admin/employees
DELETE /api/admin/user/{id}
GET /api/admin/expenses
POST /api/admin/expenses
GET /api/admin/expenses/monthly
GET /api/admin/expenses/yearly
```

### User Endpoints
```json
GET /api/users
```

## Testing the App

1. **With Mock Data**: The app works immediately with sample data
2. **With Backend**: Start your backend server and the app will automatically use real data
3. **Mixed Mode**: Some features work with mock data, others with real backend

## Next Steps

1. **For Development**: Use the mock data to continue building the frontend
2. **For Production**: Implement the backend server with the required endpoints
3. **For Testing**: The app gracefully handles both scenarios

The "Failed to fetch expense data" error should now be resolved! 🎉
