package com.school.fee_management.controller;

import com.school.fee_management.entity.Student;
import com.school.fee_management.entity.User;
import com.school.fee_management.repository.UserRepository;
import com.school.fee_management.service.AuthService;
import com.school.fee_management.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentController {
    
    @Autowired
    private StudentService studentService;
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }
    
    @GetMapping("/class/{className}")
    public ResponseEntity<List<Student>> getStudentsByClass(@PathVariable String className) {
        return ResponseEntity.ok(studentService.getStudentsByClass(className));
    }
    
    @PostMapping
    public ResponseEntity<?> addStudent(@RequestBody Student student, 
                                        @RequestHeader("Authorization") String token) {
        // Check if admin
        if (!authService.isAdmin(token)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin only."));
        }
        
        // Handle parent creation if parent email provided
        if (student.getParentEmail() != null && !student.getParentEmail().isEmpty()) {
            Optional<User> existingParent = userRepository.findByEmail(student.getParentEmail());
            if (existingParent.isPresent()) {
                student.setParent(existingParent.get());
            } else {
                // Create new parent user
                User newParent = new User();
                newParent.setEmail(student.getParentEmail());
                newParent.setName(student.getParentName() != null ? student.getParentName() : student.getParentEmail().split("@")[0]);
                newParent.setPassword(student.getParentEmail().split("@")[0]);
                newParent.setRole(User.Role.PARENT);
                User savedParent = userRepository.save(newParent);
                student.setParent(savedParent);
            }
        }
        
        Student newStudent = studentService.addStudent(student, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(newStudent);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, 
                                           @RequestBody Student student,
                                           @RequestHeader("Authorization") String token) {
        if (!authService.isAdmin(token)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin only."));
        }
        return ResponseEntity.ok(studentService.updateStudent(id, student));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id,
                                           @RequestHeader("Authorization") String token) {
        if (!authService.isAdmin(token)) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied. Admin only."));
        }
        studentService.deleteStudent(id);
        return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
    }
    
    @GetMapping("/{id}/pending-fee")
    public ResponseEntity<Map<String, Object>> getPendingFee(@PathVariable Long id) {
        BigDecimal pendingFee = studentService.getPendingFee(id);
        Map<String, Object> response = new HashMap<>();
        response.put("studentId", id);
        response.put("pendingFee", pendingFee);
        return ResponseEntity.ok(response);
    }
}