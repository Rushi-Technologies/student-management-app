package com.rt.sm.controller;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.rt.sm.pojo.Student;
import com.rt.sm.repo.StudentRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/students")
@CrossOrigin // allow cross-origin requests (adjust in production as needed)
public class StudentRestController {

    @Autowired
    private StudentRepo studentRepo;

    private static final Logger logger = LoggerFactory.getLogger(StudentRestController.class);

    @GetMapping
    public List<Student> getAllStudents() {
        logger.info("GET /api/students - fetch all students");
        List<Student> students = studentRepo.findAll();
        logger.debug("Found {} students", students.size());
        return students;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable String id) {
        logger.info("GET /api/students/{} - fetch student by id", id);
        return studentRepo.findById(id)
                .map(s -> {
                    logger.debug("Student {} found", id);
                    return ResponseEntity.ok(s);
                })
                .orElseGet(() -> {
                    logger.warn("Student {} not found", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<Student> createStudent(@Valid @RequestBody Student student, UriComponentsBuilder uriBuilder) {
        logger.info("POST /api/students - create student request: name='{}', email='{}'", student.getName(), student.getEmail());
        // If client didn't provide an ID, generate one similar to the web controller
        if (student.getId() == null || student.getId().isEmpty()) {
            String empId = "STD" + (1000 + new Random().nextInt(9000));
            student.setId(empId);
            logger.debug("Generated id {} for new student", empId);
        }
        Student saved = studentRepo.save(student);
        logger.info("Student created with id={}", saved.getId());
        URI location = uriBuilder.path("/api/students/{id}").buildAndExpand(saved.getId()).toUri();
        return ResponseEntity.created(location).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable String id, @Valid @RequestBody Student student) {
        logger.info("PUT /api/students/{} - update request", id);
        return studentRepo.findById(id).map(existing -> {
            student.setId(id);
            Student saved = studentRepo.save(student);
            logger.info("Student {} updated", id);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> {
            logger.warn("Student {} not found for update", id);
            return ResponseEntity.notFound().build();
        });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable String id) {
        logger.info("DELETE /api/students/{} - delete request", id);
        return studentRepo.findById(id).map(s -> {
            studentRepo.deleteById(id);
            logger.info("Student {} deleted", id);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> {
            logger.warn("Student {} not found for delete", id);
            return ResponseEntity.notFound().build();
        });
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAllStudents() {
        logger.info("DELETE /api/students - delete all students request");
        studentRepo.deleteAll();
        logger.info("All students deleted");
        return ResponseEntity.noContent().build();
    }

    // Return structured validation errors when @Valid fails
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        logger.warn("Validation failed: {} errors", ex.getBindingResult().getErrorCount());
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
            logger.debug("Validation error on field '{}': {}", error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(errors);
    }
}
