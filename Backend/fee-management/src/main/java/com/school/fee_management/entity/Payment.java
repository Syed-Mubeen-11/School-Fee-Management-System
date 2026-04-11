package com.school.fee_management.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "payments")
@Data
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "receipt_no", unique = true)
    private String receiptNo;
    
    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;
    
    @Column(name = "amount_paid")
    private BigDecimal amountPaid;
    
    @Column(name = "payment_date")
    private LocalDate paymentDate;
    
    @Column(name = "payment_mode")
    @Enumerated(EnumType.STRING)
    private PaymentMode paymentMode;
    
    private String remarks;
    
    public enum PaymentMode {
        CASH, CARD, ONLINE
    }
}