package com.rt.sm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class StudentManagementApplication {

	private static final Logger logger = LoggerFactory.getLogger(StudentManagementApplication.class);

	public static void main(String[] args) {
		logger.info("Starting Student Management Application");
		SpringApplication.run(StudentManagementApplication.class, args);
		logger.info("Student Management Application started");
	}

}
