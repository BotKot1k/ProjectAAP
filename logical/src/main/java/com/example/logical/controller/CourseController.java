package com.example.logical.controller;

import com.example.logical.dto.CourseDTO;
import com.example.logical.services.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CourseController {
    @Autowired
    private CourseService courseService;

    @GetMapping("/courses")
    public List<CourseDTO> getAllCourses(@RequestParam Long current_id) {
        return courseService.getAllCourses(current_id);
    }

    @GetMapping("/course/{course_id}")
    public CourseDTO getCourse(@PathVariable Long course_id, @RequestParam Long current_id) {
        return courseService.getCourseById(current_id, course_id);
    }

    @PatchMapping("/course/{course_id}")
    public void updateDescription(@PathVariable Long course_id, @RequestParam Long current_id, @RequestParam String description) {
        courseService.updateDescription(current_id, course_id, description);
    }

    @DeleteMapping("/course/{course_id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCourse(@PathVariable Long course_id, @RequestParam Long current_id) {
        courseService.deleteCourseById(current_id, course_id);
    }

    @PostMapping("/course")
    @ResponseStatus(HttpStatus.CREATED)
    public void createCourse(@RequestBody CourseDTO courseDTO, @RequestParam Long current_id) {
        courseService.createCourse(current_id, courseDTO);
    }

}
