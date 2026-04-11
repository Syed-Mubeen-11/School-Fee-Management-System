package com.school.fee_management.repository;

import com.school.fee_management.entity.Payment;
import com.school.fee_management.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByStudent(Student student);
    
    @Query("SELECT SUM(p.amountPaid) FROM Payment p WHERE p.student = :student")
    BigDecimal getTotalPaidByStudent(@Param("student") Student student);
    
    @Query("SELECT SUM(p.amountPaid) FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal getTotalCollectionBetweenDates(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    List<Payment> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);
}