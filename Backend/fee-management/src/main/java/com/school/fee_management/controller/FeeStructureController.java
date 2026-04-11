package com.school.fee_management.controller;

import com.school.fee_management.entity.FeeHead;
import com.school.fee_management.entity.FeeStructure;
import com.school.fee_management.repository.FeeHeadRepository;
import com.school.fee_management.repository.FeeStructureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fee-structure")
@CrossOrigin(origins = "http://localhost:5173")
public class FeeStructureController {
    
    @Autowired
    private FeeStructureRepository feeStructureRepository;
    
    @Autowired
    private FeeHeadRepository feeHeadRepository;
    
    // Get all fee heads
    @GetMapping("/heads")
    public ResponseEntity<List<FeeHead>> getAllFeeHeads() {
        return ResponseEntity.ok(feeHeadRepository.findAll());
    }
    
    // Add fee head
    @PostMapping("/heads")
    public ResponseEntity<FeeHead> addFeeHead(@RequestBody FeeHead feeHead) {
        FeeHead saved = feeHeadRepository.save(feeHead);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    // Delete fee head
    @DeleteMapping("/heads/{id}")
    public ResponseEntity<?> deleteFeeHead(@PathVariable Long id) {
        try {
            // First delete all fee structure entries that use this fee head
            List<FeeStructure> structures = feeStructureRepository.findAll();
            for (FeeStructure fs : structures) {
                if (fs.getFeeHead() != null && fs.getFeeHead().getId().equals(id)) {
                    feeStructureRepository.delete(fs);
                }
            }
            // Then delete the fee head
            feeHeadRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Fee head deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to delete fee head: " + e.getMessage()));
        }
    }
    
    // Get all fee structures
    @GetMapping
    public ResponseEntity<List<FeeStructure>> getAllFeeStructures() {
        return ResponseEntity.ok(feeStructureRepository.findAll());
    }
    
    // Get fee structure by class
    @GetMapping("/class/{className}")
    public ResponseEntity<List<FeeStructure>> getFeeStructureByClass(@PathVariable String className) {
        return ResponseEntity.ok(feeStructureRepository.findByClassName(className));
    }
    
    // Add or update fee structure
    @PostMapping
    public ResponseEntity<FeeStructure> addFeeStructure(@RequestBody FeeStructure feeStructure) {
        FeeStructure saved = feeStructureRepository.save(feeStructure);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    
    // Update fee structure
    @PutMapping("/{id}")
    public ResponseEntity<FeeStructure> updateFeeStructure(@PathVariable Long id, @RequestBody FeeStructure feeStructure) {
        feeStructure.setId(id);
        FeeStructure saved = feeStructureRepository.save(feeStructure);
        return ResponseEntity.ok(saved);
    }
    
    // Delete fee structure
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeeStructure(@PathVariable Long id) {
        feeStructureRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Fee structure deleted"));
    }
}