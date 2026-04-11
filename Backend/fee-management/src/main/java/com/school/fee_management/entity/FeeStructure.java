package com.school.fee_management.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "fee_structure")
@Data
public class FeeStructure {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "class")
    private String className;
    
    @ManyToOne
    @JoinColumn(name = "fee_head_id")
    private FeeHead feeHead;
    
    private BigDecimal amount;
}