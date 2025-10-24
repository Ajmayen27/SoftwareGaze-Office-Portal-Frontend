# Quick Backend Setup Commands

## 🚀 **Start Your Backend Server**

### 1. **Navigate to your backend project directory**
```bash
cd path/to/your/backend/project
```

### 2. **Start the Spring Boot application**
```bash
# If using Maven
mvn spring-boot:run

# If using Gradle
./gradlew bootRun

# Or run the main class directly
java -jar your-backend-app.jar
```

### 3. **Verify backend is running**
```bash
curl http://localhost:8081/api/admin/expenses
```

## 🔧 **Backend Configuration Checklist**

### **1. CORS Configuration**
Add this to your main controller or configuration class:

```java
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class YourController {
    // Your endpoints
}
```

### **2. H2 Database Configuration**
In your `application.properties`:

```properties
# H2 Database
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.h2.console.enabled=true
```

### **3. JWT Configuration**
Make sure your JWT configuration matches the frontend expectations:

```java
@Configuration
public class JwtConfig {
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private int expiration;
    
    // Your JWT configuration
}
```

## 🧪 **Test Your Backend**

### **1. Check H2 Console**
Visit: `http://localhost:8081/h2-console`
- Username: `sa`
- Password: `password`
- JDBC URL: `jdbc:h2:mem:testdb`

### **2. Test API Endpoints**
```bash
# Test authentication
curl -X POST http://localhost:8081/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test","email":"test@test.com","designation":"Developer","role":"USER"}'

# Test admin endpoints (with JWT token)
curl -X GET http://localhost:8081/api/admin/expenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **3. Use the Frontend Test Tool**
1. Go to your React app dashboard
2. Look for "Backend Connection Test" section
3. Click "Test Backend Connection"
4. Check if all endpoints return success

## 🎯 **Expected Results**

Once your backend is running:
- ✅ **"Backend Connected"** status in dashboard
- ✅ **Real data** from H2 database
- ✅ **Persistent storage** - data survives restarts
- ✅ **Working forms** - add/edit/delete operations
- ✅ **Authentication** - proper login flow

## 🔍 **Troubleshooting**

### **If backend won't start:**
1. Check if port 8081 is available
2. Verify Java version compatibility
3. Check application.properties configuration
4. Look for startup errors in console

### **If frontend can't connect:**
1. Verify CORS configuration
2. Check if backend is actually running on port 8081
3. Test with curl commands
4. Check browser console for errors

### **If database issues:**
1. Check H2 console access
2. Verify table creation
3. Check JPA entity mappings
4. Look for SQL errors in logs

Your backend should now work with the React frontend! 🎉
