# Fix Spring Security AuthorizationDeniedException

## 🔍 **Problem Analysis**
Your backend is running but Spring Security is blocking requests with `AuthorizationDeniedException: Access Denied`. This happens when:

1. **JWT token is not being validated properly**
2. **Security configuration is too restrictive**
3. **Role-based access is not configured correctly**

## 🔧 **Backend Security Configuration Fix**

### 1. **Update Security Configuration**

Replace your current `SecurityConfig` with this:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

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
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

### 2. **JWT Request Filter**

Make sure your `JwtRequestFilter` is properly configured:

```java
@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain chain) throws ServletException, IOException {
        
        final String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtUtil.getUsernameFromToken(jwtToken);
            } catch (IllegalArgumentException e) {
                System.out.println("Unable to get JWT Token");
            } catch (ExpiredJwtException e) {
                System.out.println("JWT Token has expired");
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwtToken, userDetails)) {
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken
                    .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        chain.doFilter(request, response);
    }
}
```

### 3. **JWT Authentication Entry Point**

Create this class:

```java
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
    }
}
```

### 4. **Controller Configuration**

Update your controllers:

```java
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AdminController {

    @GetMapping("/expenses")
    public ResponseEntity<List<Expense>> getExpenses() {
        // Your logic
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @PostMapping("/expenses")
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense) {
        // Your logic
        Expense savedExpense = expenseService.saveExpense(expense);
        return ResponseEntity.ok(savedExpense);
    }
}
```

## 🚀 **Quick Fix Steps**

### 1. **Update Security Configuration**
Replace your current SecurityConfig with the one above

### 2. **Add JWT Authentication Entry Point**
Create the JwtAuthenticationEntryPoint class

### 3. **Update JWT Request Filter**
Make sure your JWT filter is properly validating tokens

### 4. **Restart Backend**
```bash
# Stop your backend (Ctrl+C)
# Then restart
mvn spring-boot:run
```

### 5. **Test Authentication**
1. Go to your React app
2. Try to login
3. Check if JWT token is being sent in requests
4. Test adding an expense

## 🔍 **Debug Steps**

### 1. **Check JWT Token**
In browser DevTools → Network tab → Look for Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### 2. **Check Backend Logs**
Look for JWT validation messages in your backend console

### 3. **Test with curl**
```bash
# Get JWT token first
curl -X POST http://localhost:8081/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Use the token to test admin endpoint
curl -X GET http://localhost:8081/api/admin/expenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 **Expected Result**

After these fixes:
- ✅ **No more AuthorizationDeniedException**
- ✅ **JWT tokens are properly validated**
- ✅ **Admin endpoints work correctly**
- ✅ **Expenses can be added successfully**

The main issue is that your Spring Security configuration needs to properly validate JWT tokens and allow authenticated users to access admin endpoints! 🎉
