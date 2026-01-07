package com.example.logical.services;

import com.example.logical.dto.TestDTO;
import com.example.logical.entity.Course_test;
import com.example.logical.entity.Test;
import com.example.logical.exception.BadRequestException;
import com.example.logical.exception.NotFoundException;
import com.example.logical.repositories.CourseRepository;
import com.example.logical.repositories.Course_testRepository;
import com.example.logical.repositories.TestRepository;
import com.example.logical.security.Action;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class Course_testService {
    @Autowired
    private Course_testRepository course_testRepository;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private PermissionService permissionService;

    public List<Object[]> findAllCourseTest(Long current_id, Long course_id){
        if(course_id == null){
            throw new BadRequestException("Course id is null");
        }
        if(!course_testRepository.existsByCourse_courseId(course_id)){
            throw new NotFoundException("Course", course_id);
        }
        permissionService.check(Action.TEST_GET_ALL, current_id);
        return course_testRepository.findAllByTest(course_id);
    }

    @Transactional
    public Long createNewCourseTest(Long current_id, Long course_id, TestDTO testDTO){
        if(course_id == null){
            throw new BadRequestException("Course id is null");
        }
        if(!courseRepository.existsById(course_id)){
            throw new NotFoundException("Course", course_id);
        }
        if(testDTO == null){
            throw new BadRequestException("TestDTO is null");
        }
        permissionService.check(Action.TEST_CREATE, current_id);
        Test test = new Test();
        test.setTest_name(testDTO.getTest_name());
        testRepository.save(test);
        Course_test course_test = new Course_test();
        course_test.setCourse(courseRepository.findById(course_id).get());
        course_test.setTest(test);
        course_testRepository.save(course_test);
        return test.getTestId();
    }

    @Transactional
    public void deleteCourseTest(Long current_id, Long course_id, Long test_id){
        if(course_id == null){
            throw new BadRequestException("Course id is null");
        }
        permissionService.check(Action.TEST_DELETE, current_id);
        course_testRepository.deleteСourse_test(course_id, test_id);
    }
}
