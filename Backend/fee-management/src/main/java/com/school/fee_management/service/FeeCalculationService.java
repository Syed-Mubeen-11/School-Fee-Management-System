package com.school.fee_management.service;

import com.school.fee_management.entity.FeeStructure;
import com.school.fee_management.entity.Student;
import com.school.fee_management.repository.FeeStructureRepository;
import com.school.fee_management.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class FeeCalculationService {
    
    @Autowired
    private FeeStructureRepository feeStructureRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    public BigDecimal getTotalFeeForStudent(Student student) {
        List<FeeStructure> feeStructures = feeStructureRepository.findByClassName(student.getClassName());
        return feeStructures.stream()
                .map(FeeStructure::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public BigDecimal getPendingFeeForStudent(Student student) {
        BigDecimal totalFee = getTotalFeeForStudent(student);
        BigDecimal totalPaid = paymentRepository.getTotalPaidByStudent(student);
        if (totalPaid == null) {
            totalPaid = BigDecimal.ZERO;
        }
        return totalFee.subtract(totalPaid);
    }
    
    public boolean hasPendingFees(Student student) {
        return getPendingFeeForStudent(student).compareTo(BigDecimal.ZERO) > 0;
    }
}