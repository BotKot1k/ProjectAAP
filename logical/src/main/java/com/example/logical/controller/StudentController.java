package com.example.logical.controller;

import com.example.logical.dto.StudentDTO;
import com.example.logical.services.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class StudentController {
    @Autowired
    private StudentService studentService;

    @GetMapping("course/user/{user_id}")
    public List<Object[]> findAllUserCourses(@PathVariable Long user_id, @RequestParam Long current_id){
        return studentService.findAllUserCourses(current_id, user_id);
    }

    @PostMapping("student")
    public void createStudent(@RequestParam Long current_id, @RequestBody StudentDTO studentDTO){
        studentService.createAnyStudent(current_id, studentDTO);
    }

    @DeleteMapping("course/{course_id}/user/{user_id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAnyStudent(@PathVariable Long course_id, @PathVariable Long user_id, @RequestParam Long current_id){
        studentService.deleteStudentForCourse(current_id, course_id, user_id);
    }



}
