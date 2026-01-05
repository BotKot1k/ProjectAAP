package com.example.logical.services;

import com.example.logical.dto.StudentDTO;
import com.example.logical.entity.Student;
import com.example.logical.exception.BadRequestException;
import com.example.logical.exception.NotFoundException;
import com.example.logical.repositories.CourseRepository;
import com.example.logical.repositories.StudentRepository;
import com.example.logical.repositories.UserRepository;
import com.example.logical.security.Action;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PermissionService permissionService;

    public List<Object[]> findAllUserCourses(Long current_id, Long user_id){
        if(!studentRepository.existsByUser_UserId(user_id)){
            throw new NotFoundException("user", user_id);
        }
        permissionService.check(Action.STUDENT_GET_ALL_USER_COURSES, current_id);
        return studentRepository.findAllUserCourses(user_id);
    }

    public void createAnyStudent(Long current_id, StudentDTO studentDTO){
        if(!userRepository.existsById(studentDTO.getUser_id())){
            throw new NotFoundException("user", studentDTO.getUser_id());
        }
        if(!courseRepository.existsById(studentDTO.getCourse_id())){
            throw new NotFoundException("course", studentDTO.getCourse_id());
        }
        if(studentDTO == null){
            throw new BadRequestException("studentDTO cannot be null");
        }
        permissionService.check(Action.STUDENT_CREATE, current_id);
        Student student = new Student();
        student.setUser(userRepository.findByUserIdNotOptional(studentDTO.getUser_id()));
        student.setCourse(courseRepository.findByCourseIdNoOptional(studentDTO.getCourse_id()));
        studentRepository.save(student);
    }

    public void deleteStudentForCourse(Long current_id, Long course_id, Long user_id){
        if(!studentRepository.existsByUser_UserId(user_id)){
            throw new NotFoundException("user", user_id);
        }
        permissionService.check(Action.STUDENT_DELETE, current_id);
        studentRepository.deleteStudent(user_id, course_id);
    }
}
