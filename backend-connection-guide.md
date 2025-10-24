# Backend Connection Guide for H2 Database

## ✅ **I've Switched Back to Real API Calls**

The app now uses your actual backend API instead of mock data. Here's what you need to do:

## 🔧 **Backend Requirements**

### 1. **Start Your Backend Server**
Make sure your Spring Boot backend is running on `http://localhost:8081`

### 2. **Required Endpoints**
Your backend must implement these exact endpoints:

#### **Authentication Endpoints:**
```
POST /api/auth/signup
POST /api/auth/signin
```

#### **Admin Endpoints:**
```
GET /api/admin/employees
DELETE /api/admin/user/{id}
GET /api/admin/expenses
POST /api/admin/expenses
GET /api/admin/expenses/monthly
GET /api/admin/expenses/yearly
```

#### **User Endpoints:**
```
GET /api/users
```

### 3. **CORS Configuration**
Make sure your backend has CORS enabled for `http://localhost:5173` (Vite dev server)

```java
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class YourController {
    // Your endpoints
}
```

## 🗄️ **H2 Database Setup**

### 1. **Database Configuration**
In your `application.properties`:

```properties
# H2 Database Configuration
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

# H2 Console (for testing)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA Configuration
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
```

### 2. **Sample Data (Optional)**
Add some initial data in your `data.sql`:

```sql
-- Sample users
INSERT INTO users (username, password, email, designation, role) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'admin@example.com', 'Administrator', 'ADMIN'),
('user1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'user1@example.com', 'Developer', 'USER');

-- Sample expenses
INSERT INTO expenses (bill_type, amount, comment, date) VALUES
('Office Supplies', 150.00, 'Stationery and supplies', '2025-01-20'),
('Internet Bill', 120.00, 'Monthly internet connection', '2025-01-19');
```

## 🚀 **Testing the Connection**

### 1. **Check Backend Status**
- Look for "Backend Connected" status in the dashboard
- If you see "Using Mock Data", your backend isn't running

### 2. **Test Authentication**
- Try to sign up a new user
- Try to sign in with existing credentials

### 3. **Test Admin Features**
- Add an expense (should save to H2 database)
- View employees (should show users from database)
- Check analytics (should calculate from real data)

## 🔍 **Troubleshooting**

### **If you get "Failed to fetch" errors:**

1. **Check if backend is running:**
   ```bash
   curl http://localhost:8081/api/admin/expenses
   ```

2. **Check CORS settings:**
   - Make sure your backend allows requests from `http://localhost:5173`

3. **Check database connection:**
   - Visit `http://localhost:8081/h2-console`
   - Login with username: `sa`, password: `password`
   - Check if tables exist and have data

4. **Check console for errors:**
   - Open browser DevTools (F12)
   - Look for network errors in Console tab

### **Common Issues:**

1. **CORS Error**: Add `@CrossOrigin` annotation to your controllers
2. **Authentication Error**: Make sure JWT tokens are properly configured
3. **Database Error**: Check H2 console and table structure
4. **Port Conflict**: Make sure port 8081 is not used by another service

## 📊 **Expected Behavior**

Once connected, you should see:
- ✅ **Real data** from your H2 database
- ✅ **Persistent storage** - data survives server restarts
- ✅ **Live updates** - changes reflect immediately
- ✅ **Authentication** - proper login/logout flow
- ✅ **Role-based access** - admin vs user features

## 🎯 **Next Steps**

1. **Start your backend server**
2. **Check the status indicator** in the dashboard
3. **Test adding an expense** - it should save to H2 database
4. **Verify data persistence** by refreshing the page
5. **Check H2 console** to see your data

Your app is now configured to use your real H2 database backend! 🎉
