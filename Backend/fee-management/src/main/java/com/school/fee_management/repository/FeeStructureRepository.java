package com.school.fee_management.repository;

import com.school.fee_management.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    List<FeeStructure> findByClassName(String className);
}
