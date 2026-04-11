package com.school.fee_management.service;

import com.school.fee_management.entity.User;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    
    // Store active sessions (same as in AuthController)
    private Map<String, User> activeSessions = new ConcurrentHashMap<>();
    
    public void addSession(String token, User user) {
        activeSessions.put(token, user);
    }
    
    public User getUserFromToken(String token) {
        return activeSessions.get(token);
    }
    
    public void removeSession(String token) {
        activeSessions.remove(token);
    }
    
    public boolean isAdmin(String token) {
        User user = getUserFromToken(token);
        return user != null && user.getRole() == User.Role.ADMIN;
    }
    
    public boolean isAdminOrAccountant(String token) {
        User user = getUserFromToken(token);
        return user != null && (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.ACCOUNTANT);
    }
    
    public boolean isParentOfStudent(String token, Long studentId) {
        User user = getUserFromToken(token);
        if (user == null || user.getRole() != User.Role.PARENT) {
            return false;
        }
        // We'll implement parent-student relationship check later
        return true; // Placeholder
    }
}