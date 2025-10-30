package com.rt.sm.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class StudentController {

    private static final Logger logger = LoggerFactory.getLogger(StudentController.class);

    // display the html page
    @GetMapping("/")
    public String getIndex() {
        logger.info("GET / - serving index page");
        try {
            return "index";
        } catch (Exception ex) {
            logger.error("Error while serving index page", ex);
            throw ex;
        }
    }
}
