package com.school.fee_management.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "students")
@Data
public class Student {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "roll_no", unique = true, nullable = false)
    private String rollNo;
    
    private String name;
    
    @Column(name = "class")
    private String className;
    
    private String section;
    
    @Column(name = "parent_email")
    private String parentEmail;
    
    @Column(name = "parent_name")
    private String parentName;
    
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private User parent;
}