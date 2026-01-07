package com.example.logical.controller;


import com.example.logical.dto.TestDTO;
import com.example.logical.services.Course_testService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course/{course_id}/test")
public class Course_testController {
    @Autowired
    private Course_testService course_testService;

    @GetMapping
    public List<Object[]> getCourseTest(@PathVariable("course_id") Long course_id, @RequestParam Long current_id){
        return course_testService.findAllCourseTest(current_id, course_id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Long createCourse_test(@RequestBody TestDTO testDTO, @RequestParam Long current_id, @PathVariable Long course_id) {
        return course_testService.createNewCourseTest(current_id, course_id, testDTO);
    }

    @DeleteMapping("/{test_id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCourse_test(@PathVariable Long test_id, @RequestParam Long current_id, @PathVariable Long course_id) {
        course_testService.deleteCourseTest(current_id, course_id, test_id);
    }
}
