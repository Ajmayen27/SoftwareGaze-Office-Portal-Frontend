# Spring Boot Backend Configuration Fix

## 🔍 **Problem Analysis**
- **403 Forbidden** for Auth endpoints = CORS or authentication issues
- **Failed to fetch** for other endpoints = CORS blocking requests
- Your backend is running but not properly configured for frontend access

## 🔧 **Required Backend Configuration**

### 1. **CORS Configuration (CRITICAL)**

Create a CORS configuration class in your Spring Boot project:

```java
@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 2. **Security Configuration**

Update your Security configuration:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/users").hasAnyRole("ADMIN", "USER")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

### 3. **Controller Configuration**

Make sure your controllers have proper CORS annotations:

```java
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        // Your signup logic
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/auth/signin")
    public ResponseEntity<?> signin(@RequestBody SigninRequest request) {
        // Your signin logic
        return ResponseEntity.ok(Map.of("jwt", "your-jwt-token"));
    }
}
```

### 4. **Admin Controller**

```java
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @GetMapping("/employees")
    public ResponseEntity<List<User>> getEmployees() {
        // Your logic
        return ResponseEntity.ok(employeeList);
    }

    @GetMapping("/expenses")
    public ResponseEntity<List<Expense>> getExpenses() {
        // Your logic
        return ResponseEntity.ok(expenseList);
    }

    @PostMapping("/expenses")
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense) {
        // Your logic
        return ResponseEntity.ok(savedExpense);
    }
}
```

## 🚀 **Quick Fix Steps**

### 1. **Add CORS Configuration**
Create the WebConfig class above in your Spring Boot project

### 2. **Update Security Configuration**
Update your SecurityConfig to allow CORS and proper authentication

### 3. **Restart Your Backend**
```bash
# Stop your backend (Ctrl+C)
# Then restart
mvn spring-boot:run
```

### 4. **Test Again**
Go back to your React app and click "Test Backend Connection"

## 🔍 **Verification Steps**

### 1. **Test CORS with curl:**
```bash
curl -X OPTIONS http://localhost:8081/api/auth/signup \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

### 2. **Test Authentication:**
```bash
curl -X POST http://localhost:8081/api/auth/signup \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"username":"test","password":"test","email":"test@test.com","designation":"Developer","role":"USER"}'
```

### 3. **Check Browser Console**
Look for CORS errors in browser DevTools

## 📋 **Common Issues & Solutions**

### **Issue: 403 Forbidden**
- **Solution**: Add CORS configuration and update Security config

### **Issue: Failed to fetch**
- **Solution**: Enable CORS for all origins and methods

### **Issue: Authentication not working**
- **Solution**: Make sure JWT configuration matches frontend expectations

### **Issue: Still getting errors**
- **Solution**: Check if backend is actually running on port 8081

## 🎯 **Expected Result**

After these fixes:
- ✅ **All endpoints return 200 OK**
- ✅ **CORS errors disappear**
- ✅ **Authentication works**
- ✅ **Admin endpoints accessible**
- ✅ **Frontend can connect successfully**

The main issue is **CORS configuration** - your Spring Boot backend needs to explicitly allow requests from `http://localhost:5173`! 🎉
