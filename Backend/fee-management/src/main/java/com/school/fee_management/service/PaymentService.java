package com.school.fee_management.service;

import com.school.fee_management.entity.Payment;
import com.school.fee_management.entity.Student;
import com.school.fee_management.repository.PaymentRepository;
import com.school.fee_management.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PaymentService {
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private FeeCalculationService feeCalculationService;
    
    public Payment recordPayment(Long studentId, BigDecimal amountPaid, String paymentMode, String remarks) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));
        
        // Generate receipt number: RCP-YYYYMMDD-XXXX
        String receiptNo = generateReceiptNumber();
        
        Payment payment = new Payment();
        payment.setReceiptNo(receiptNo);
        payment.setStudent(student);
        payment.setAmountPaid(amountPaid);
        payment.setPaymentDate(LocalDate.now());
        payment.setPaymentMode(Payment.PaymentMode.valueOf(paymentMode));
        payment.setRemarks(remarks);
        
        return paymentRepository.save(payment);
    }
    
    private String generateReceiptNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = paymentRepository.count() + 1;
        return String.format("RCP-%s-%04d", date, count);
    }
    
    public List<Payment> getPaymentsByStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        return paymentRepository.findByStudent(student);
    }
    
    public BigDecimal getDailyCollection(LocalDate date) {
        BigDecimal collection = paymentRepository.getTotalCollectionBetweenDates(date, date);
        return collection != null ? collection : BigDecimal.ZERO;
    }
    
    public BigDecimal getMonthlyCollection(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        BigDecimal collection = paymentRepository.getTotalCollectionBetweenDates(startDate, endDate);
        return collection != null ? collection : BigDecimal.ZERO;
    }
    
    public List<Payment> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return paymentRepository.findByPaymentDateBetween(startDate, endDate);
    }
    
    public List<Student> getDefaulters() {
        List<Student> allStudents = studentRepository.findAll();
        return allStudents.stream()
                .filter(feeCalculationService::hasPendingFees)
                .toList();
    }
}