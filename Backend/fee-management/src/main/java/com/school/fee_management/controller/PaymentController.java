package com.school.fee_management.controller;

import com.school.fee_management.entity.Payment;
import com.school.fee_management.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;
    
    // Record a payment
    @PostMapping("/record")
    public ResponseEntity<Payment> recordPayment(@RequestBody Map<String, Object> paymentRequest) {
        Long studentId = ((Number) paymentRequest.get("studentId")).longValue();
        BigDecimal amountPaid = new BigDecimal(paymentRequest.get("amountPaid").toString());
        String paymentMode = (String) paymentRequest.get("paymentMode");
        String remarks = (String) paymentRequest.get("remarks");
        
        Payment payment = paymentService.recordPayment(studentId, amountPaid, paymentMode, remarks);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }
    
    // Get payments by student
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Payment>> getPaymentsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(paymentService.getPaymentsByStudent(studentId));
    }
    
    // Get daily collection
    @GetMapping("/collection/daily")
    public ResponseEntity<Map<String, Object>> getDailyCollection(@RequestParam String date) {
        LocalDate collectionDate = LocalDate.parse(date);
        BigDecimal total = paymentService.getDailyCollection(collectionDate);
        
        Map<String, Object> response = new HashMap<>();
        response.put("date", date);
        response.put("totalCollection", total);
        return ResponseEntity.ok(response);
    }
    
    // Get monthly collection
    @GetMapping("/collection/monthly")
    public ResponseEntity<Map<String, Object>> getMonthlyCollection(@RequestParam int year, 
                                                                      @RequestParam int month) {
        BigDecimal total = paymentService.getMonthlyCollection(year, month);
        
        Map<String, Object> response = new HashMap<>();
        response.put("year", year);
        response.put("month", month);
        response.put("totalCollection", total);
        return ResponseEntity.ok(response);
    }
    
    // Get defaulters list
    @GetMapping("/defaulters")
    public ResponseEntity<List<com.school.fee_management.entity.Student>> getDefaulters() {
        return ResponseEntity.ok(paymentService.getDefaulters());
    }
}