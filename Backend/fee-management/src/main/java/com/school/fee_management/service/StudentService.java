package com.school.fee_management.service;

import com.school.fee_management.entity.Student;
import com.school.fee_management.entity.User;
import com.school.fee_management.repository.StudentRepository;
import com.school.fee_management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class StudentService {
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FeeCalculationService feeCalculationService;
    
    public Student addStudent(Student student, Long parentId) {
        if (parentId != null) {
            User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found with id: " + parentId));
            student.setParent(parent);
        }
        return studentRepository.save(student);
    }
    
    public Student updateStudent(Long id, Student studentDetails) {
        Student student = studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        student.setRollNo(studentDetails.getRollNo());
        student.setName(studentDetails.getName());
        student.setClassName(studentDetails.getClassName());
        student.setSection(studentDetails.getSection());
        student.setParentEmail(studentDetails.getParentEmail());
        student.setParentName(studentDetails.getParentName());
        return studentRepository.save(student);
    }
    
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }
    
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }
    
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
    }
    
    public List<Student> getStudentsByClass(String className) {
        return studentRepository.findByClassName(className);
    }
    
    public BigDecimal getPendingFee(Long studentId) {
        Student student = getStudentById(studentId);
        return feeCalculationService.getPendingFeeForStudent(student);
    }
}