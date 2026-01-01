package com.example.logical.services;

import com.example.logical.dto.User_test_assessmentDTO;
import com.example.logical.entity.Course;
import com.example.logical.entity.Student;
import com.example.logical.entity.Test;
import com.example.logical.entity.User_test_assessment;
import com.example.logical.exception.BadRequestException;
import com.example.logical.exception.NotFoundException;
import com.example.logical.repositories.StudentRepository;
import com.example.logical.repositories.User_test_assessmentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class User_test_assessmentService {
    @Autowired
    User_test_assessmentRepository user_test_assessmentRepository;

    @Autowired
    StudentRepository studentRepository;

    public List<Object[]> getUserAssessment(Long current_id, Long course_id, Long test_id, Long user_id){
        if(!studentRepository.existsByUser_UserId(user_id)){
            throw new NotFoundException("user", user_id);
        }
        if(!user_test_assessmentRepository.existsByTest_TestId(test_id)){
            throw new NotFoundException("test", test_id);
        }
        if(!user_test_assessmentRepository.existsByCourse_CourseId(course_id)){
            throw new NotFoundException("course", course_id);
        }
        return user_test_assessmentRepository.findAllAssessmentUser(course_id, test_id, user_id);
    }

    public List<Object[]> findAllUsersPassedTheTest(Long current_id, Long course_id, Long test_id){
        if(!user_test_assessmentRepository.existsByTest_TestId(test_id)){
            throw new NotFoundException("test", test_id);
        }
        if(!user_test_assessmentRepository.existsByCourse_CourseId(course_id)){
            throw new NotFoundException("course", course_id);
        }

        return user_test_assessmentRepository.findAllUser(course_id, test_id);
    }

    public List<Object[]> findAllUserAnswersOnTest(Long current_id, Long test_id, Long user_id){
        if(!user_test_assessmentRepository.existsByTest_TestId(test_id)){
            throw new NotFoundException("test", test_id);
        }
        if(!studentRepository.existsByUser_UserId(user_id)){
            throw new NotFoundException("user", user_id);
        }
        return user_test_assessmentRepository.findQuestionNamesWithUserAnswers(test_id, user_id);
    }
    @Transactional
    public void createNewUserAssessment(Long current_id, User_test_assessmentDTO user_test_assessmentDTO){ // Очень сырой функционал этого метода
        if(user_test_assessmentDTO == null){
            throw new BadRequestException("user_test_assessmentDTO is null");
        }
        User_test_assessment user_test_assessment = new User_test_assessment();
        user_test_assessment.setCourse(new Course(user_test_assessmentDTO.getCourse()));
        user_test_assessment.setTest(new Test(user_test_assessmentDTO.getTest()));
        user_test_assessment.setStudent(new Student(user_test_assessmentDTO.getStudent()));
        user_test_assessment.setUser_answers(user_test_assessmentDTO.getUser_answers());
        user_test_assessment.setTry_test(user_test_assessmentDTO.getTry_test()); // Автоматический подсчёт надо добавить
        user_test_assessment.setTest_assessment(user_test_assessmentDTO.getTest_assessment()); // Автоматический подсчёт оценки по ответам
        user_test_assessmentRepository.save(user_test_assessment);
    }
}
