package com.example.logical.controller;

import com.example.logical.services.User_test_assessmentService;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class User_test_assessmentController {
    @Autowired
    private User_test_assessmentService user_test_assessmentService;

    @GetMapping("/course/{course_id}/test/{test_id}/user{user_id}")
    public List<Object[]> getUserAssessment(@PathVariable Long course_id, @PathVariable Long test_id, @PathVariable Long user_id, @RequestParam Long current_id){
        return user_test_assessmentService.getUserAssessment(current_id, course_id, test_id, user_id);
    }

    @GetMapping("/course/{course_id}/test/{test_id}")
    public List<Object[]> getUsersPassedTheTest(@PathVariable Long course_id, @PathVariable Long test_id, @RequestParam Long current_id){
        return user_test_assessmentService.findAllUsersPassedTheTest(current_id, course_id, test_id);
    }

    @GetMapping("/test/{test_id}/user/{user_id}")
    public List<Object[]> getUserAnswer(@PathVariable Long test_id, @PathVariable Long user_id, @RequestParam Long current_id){
        return user_test_assessmentService.findAllUserAnswersOnTest(current_id, test_id, user_id);
    }


}
