package com.school.fee_management.controller;

import com.school.fee_management.entity.User;
import com.school.fee_management.repository.UserRepository;
import com.school.fee_management.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AuthService authService;

    // Get all users (Only Admin)
    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String token) {
        if (!authService.isAdmin(token)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin only."));
        }
        return ResponseEntity.ok(userRepository.findAll());
    }

    // Get user by ID (Only Admin)
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        if (!authService.isAdmin(token)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin only."));
        }
        Optional<User> user = userRepository.findById(id);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    // Create new user (Only Admin)
    @PostMapping
    public ResponseEntity<?> createUser(@RequestHeader("Authorization") String token,
                                         @RequestBody Map<String, String> userRequest) {
        if (!authService.isAdmin(token)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin only."));
        }
        
        String email = userRequest.get("email");
        String name = userRequest.get("name");
        String role = userRequest.get("role");
        
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User already exists with this email"));
        }
        
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setRole(User.Role.valueOf(role));
        
        String defaultPassword = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
        if (defaultPassword.length() > 8) {
            defaultPassword = defaultPassword.substring(0, 8);
        }
        user.setPassword(defaultPassword);
        
        User savedUser = userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("email", savedUser.getEmail());
        response.put("name", savedUser.getName());
        response.put("role", savedUser.getRole());
        response.put("defaultPassword", defaultPassword);
        response.put("message", "User created successfully. Default password: " + defaultPassword);
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
        public ResponseEntity<?> updateUser(@PathVariable Long id, 
                                            @RequestBody Map<String, String> userRequest,
                                            @RequestHeader("Authorization") String token) {
            // Check if admin or the user themselves
            User requestingUser = authService.getUserFromToken(token);
            if (requestingUser == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            Optional<User> userOptional = userRepository.findById(id);
            if (userOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOptional.get();
            
            // Allow if admin OR user is updating their own profile
            boolean isAdmin = authService.isAdmin(token);
            boolean isSelf = requestingUser.getId().equals(user.getId());
            
            if (!isAdmin && !isSelf) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            
            // Update name (always allowed for self or admin)
            if (userRequest.containsKey("name")) {
                user.setName(userRequest.get("name"));
            }
            
            // Email can only be updated by admin
            if (userRequest.containsKey("email") && isAdmin) {
                // Check if email already exists
                Optional<User> existingUser = userRepository.findByEmail(userRequest.get("email"));
                if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
                    return ResponseEntity.status(400).body(Map.of("error", "Email already exists"));
                }
                user.setEmail(userRequest.get("email"));
            }
            
            userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User updated successfully");
            response.put("user", user);
            
            return ResponseEntity.ok(response);
        }


    // Delete user (Only Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String token, @PathVariable Long id) {
        if (!authService.isAdmin(token)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin only."));
        }
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}