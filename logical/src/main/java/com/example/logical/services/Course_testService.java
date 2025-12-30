package com.example.logical.services;

import com.example.logical.dto.Course_testDTO;
import com.example.logical.dto.TestDTO;
import com.example.logical.entity.Course_test;
import com.example.logical.entity.Test;
import com.example.logical.exception.BadRequestException;
import com.example.logical.exception.NotFoundException;
import com.example.logical.repositories.Course_testRepository;
import com.example.logical.repositories.TestRepository;
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

    public List<Object[]> findAllCourseTest(Long current_id, Long course_id){
        if(course_id == null){
            throw new BadRequestException("Course id is null");
        }
        if(!course_testRepository.existsByCourse_CourseId(course_id)){
            throw new NotFoundException("Course", course_id);
        }
        return course_testRepository.findAllByTest(course_id);
    }

    @Transactional
    public Long createNewCourseTest(Long current_id, Long course_id, TestDTO testDTO){
        if(course_id == null){
            throw new BadRequestException("Course id is null");
        }
        if(!course_testRepository.existsByCourse_CourseId(course_id)){
            throw new NotFoundException("Course", course_id);
        }
        if(testDTO == null){
            throw new BadRequestException("TestDTO is null");
        }

        Test test = new Test();
        test.setTest_name(testDTO.getTest_name());
        testRepository.save(test);
        course_testRepository.createCourseTest(course_id, test.getTestId());
        return test.getTestId();
    }
}
