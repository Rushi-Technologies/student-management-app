package com.rt.sm.controller;

import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import com.rt.sm.pojo.ConfirmationForm;
import com.rt.sm.pojo.Student;
import com.rt.sm.repo.StudentRepo;

@Controller
public class StudentController {
    
  @Autowired
  private StudentRepo studentRepo;

   // display the html page
    @GetMapping("/")
    public String getIndex(Model model) {
        List<Student> studentList = studentRepo.findAll();
        String rushiTech = "Rushi Technologies.Training & Devlopment Center.";
        model.addAttribute("rushiTech", rushiTech);
        model.addAttribute("students", studentList);
        model.addAttribute("student", new Student());
        model.addAttribute("confirmationForm", new ConfirmationForm());
        return "index";
    }

    // Insert student data
    @PostMapping("/create")
    public String newStudent(Student student, Model model) {
        model.addAttribute("student", new Student());

        // creating dynamic Student ID
        String empId = "STD";
        Random random = new Random();
        long randomNumber = 1000 + random.nextInt(9000);
        empId = empId + randomNumber;
        student.setId(empId);

        // save the student
        studentRepo.save(student);

        return "redirect:/";
    }

    // update the existing student
    @PostMapping("/update")
    public String updateStudent(@ModelAttribute Student student, Model model) {
        model.addAttribute("student", new Student());
        Optional<Student> existingStudent = studentRepo.findById(student.getId());

        // checking student exist or not
        if (existingStudent.isPresent()) {
            studentRepo.save(student);
        } else {
            model.addAttribute("errorMessage", "Student with ID " + student.getId() + " not found.");
        }
        return "redirect:/";
    }

    // delete an student by id
    @PostMapping("/remove")
    public String removeStudent(Student student, Model model) {
        model.addAttribute("student", new Student());
        Optional<Student> existingStudent = studentRepo.findById(student.getId());
        if (existingStudent.isPresent()) {
            studentRepo.deleteById(student.getId());
        }
        return "redirect:/";
    }

    // delete all students data by confromation
    @PostMapping("/remove/all")
    public String removeAll(@ModelAttribute ConfirmationForm confirmationForm, Model model) {
        String confirmation = confirmationForm.getConfirmation();
        if ("Yes".equalsIgnoreCase(confirmation)) {
            studentRepo.deleteAll();
        } else {
            return "redirect:/";
        }
        return "redirect:/";
    }
}
