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
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }
        
        User user = userOptional.get();
        
        if (!user.getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));
        }
        
        String token = UUID.randomUUID().toString();
        authService.addSession(token, user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole().name());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestHeader("Authorization") String token,
                                            @RequestBody Map<String, String> passwordRequest) {
        User user = authService.getUserFromToken(token);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        
        String oldPassword = passwordRequest.get("oldPassword");
        String newPassword = passwordRequest.get("newPassword");
        
        if (!user.getPassword().equals(oldPassword)) {
            return ResponseEntity.status(400).body(Map.of("error", "Current password is incorrect"));
        }
        
        if (newPassword == null || newPassword.length() < 4) {
            return ResponseEntity.status(400).body(Map.of("error", "New password must be at least 4 characters"));
        }
        
        user.setPassword(newPassword);
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        authService.removeSession(token);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}