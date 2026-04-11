package com.school.fee_management.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "fee_heads")
@Data
public class FeeHead {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String name;
}
