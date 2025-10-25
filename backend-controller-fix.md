# Backend Controller Fix

## 🔧 **Update AdminController.java**

Replace your current `AdminController.java` with this updated version:

```java
package com.ajmayen.softwaregazeportal.controller;

import com.ajmayen.softwaregazeportal.model.Expense;
import com.ajmayen.softwaregazeportal.model.User;
import com.ajmayen.softwaregazeportal.repository.ExpenseRepository;
import com.ajmayen.softwaregazeportal.repository.UserRepository;
import com.ajmayen.softwaregazeportal.service.MyUserDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final MyUserDetailsService myUserDetailsService;

    public AdminController(UserRepository userRepository, ExpenseRepository expenseRepository, MyUserDetailsService myUserDetailsService) {
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.myUserDetailsService = myUserDetailsService;
    }

    // User Management Endpoints
    @GetMapping("/employees")
    public List<User> getEmployees() {
        return userRepository.findAll();
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<?> updateUser(@RequestBody User user, @PathVariable Long id) {
        try {
            User existingUser = userRepository.findById(id).orElse(null);
            if (existingUser == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Update fields
            if (user.getUsername() != null) existingUser.setUsername(user.getUsername());
            if (user.getEmail() != null) existingUser.setEmail(user.getEmail());
            if (user.getDesignation() != null) existingUser.setDesignation(user.getDesignation());
            if (user.getRole() != null) existingUser.setRole(user.getRole());
            
            User updatedUser = userRepository.save(existingUser);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating user: " + e.getMessage());
        }
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("User has been deleted successfully");
    }

    // Expense Management Endpoints
    @GetMapping("/expenses")
    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    @PostMapping("/expense")  // Keep /expense for adding expenses
    public Expense addExpense(@RequestBody Expense expense) {
        return expenseRepository.save(expense);
    }

    @GetMapping("/expenses/monthly")
    public ResponseEntity<Map<String, Double>> getMonthlyExpenses() {
        LocalDate now = LocalDate.now();
        double totalMonthlyExpenses = expenseRepository.findAll().stream()
                .filter(e -> e.getDate().getMonth() == now.getMonth() && e.getDate().getYear() == now.getYear())
                .mapToDouble(Expense::getAmount)
                .sum();
        
        Map<String, Double> response = new HashMap<>();
        response.put("totalMonthlyExpenses", totalMonthlyExpenses);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expenses/yearly")
    public ResponseEntity<Map<String, Double>> getYearlyExpenses() {
        LocalDate now = LocalDate.now();
        double totalYearlyExpenses = expenseRepository.findAll().stream()
                .filter(e -> e.getDate().getYear() == now.getYear())
                .mapToDouble(Expense::getAmount)
                .sum();
        
        Map<String, Double> response = new HashMap<>();
        response.put("totalYearlyExpenses", totalYearlyExpenses);
        return ResponseEntity.ok(response);
    }

    // NEW: Monthly expenses breakdown by month
    @GetMapping("/expenses/monthly-breakdown")
    public ResponseEntity<Map<String, Object>> getMonthlyBreakdown() {
        LocalDate now = LocalDate.now();
        Map<String, Object> response = new HashMap<>();
        
        // Get expenses for each month of current year
        for (int month = 1; month <= 12; month++) {
            final int currentMonth = month;
            double monthTotal = expenseRepository.findAll().stream()
                    .filter(e -> e.getDate().getMonthValue() == currentMonth && e.getDate().getYear() == now.getYear())
                    .mapToDouble(Expense::getAmount)
                    .sum();
            
            String monthName = LocalDate.of(now.getYear(), month, 1).getMonth().name();
            response.put(monthName.toLowerCase(), monthTotal);
        }
        
        return ResponseEntity.ok(response);
    }
}
```

## 🚀 **Key Changes Made:**

1. **Correct Endpoint Structure**: 
   - `@PostMapping("/expense")` for adding expenses
   - `@GetMapping("/expenses")` for getting all expenses
   - `@GetMapping("/expenses/monthly")` for monthly sum
   - `@GetMapping("/expenses/yearly")` for yearly sum

2. **Enhanced User Update**: 
   - `@PutMapping("/user/{id}")` for updating user details
   - Better error handling and validation

3. **Monthly Breakdown**: 
   - New endpoint `/expenses/monthly-breakdown` for month-wise analysis
   - Returns expenses for each month of the current year

4. **Better Response Format**: 
   - All endpoints return consistent JSON responses
   - Monthly/yearly endpoints return proper JSON with keys

## 📋 **Endpoint Summary:**

- `GET /api/admin/employees` - Get all employees
- `PUT /api/admin/user/{id}` - Update user details
- `DELETE /api/admin/user/{id}` - Delete user
- `GET /api/admin/expenses` - Get all expenses
- `POST /api/admin/expense` - Add new expense
- `GET /api/admin/expenses/monthly` - Get monthly expenses sum
- `GET /api/admin/expenses/yearly` - Get yearly expenses sum
- `GET /api/admin/expenses/monthly-breakdown` - Get month-wise breakdown

## 🔄 **Next Steps:**

1. Update your backend controller with the code above
2. Restart your Spring Boot application
3. Test the endpoints using the frontend
