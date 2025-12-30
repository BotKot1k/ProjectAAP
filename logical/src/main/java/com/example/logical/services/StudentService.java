package com.example.logical.services;

import com.example.logical.dto.StudentDTO;
import com.example.logical.entity.Course;
import com.example.logical.entity.Student;
import com.example.logical.entity.Users;
import com.example.logical.exception.BadRequestException;
import com.example.logical.exception.NotFoundException;
import com.example.logical.repositories.CourseRepository;
import com.example.logical.repositories.StudentRepository;
import com.example.logical.repositories.UserRepository;
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

    public List<Object[]> findAllUserCourses(Long current_id, Long user_id){
        if(!studentRepository.existsByUser_UserId(user_id)){
            throw new NotFoundException("user", user_id);
        }
        return studentRepository.findAllUserCourses(user_id);
    }

    public void createAnyStudent(Long current_id, StudentDTO studentDTO){
        if(!userRepository.existsById(studentDTO.getUser().getId())){
            throw new NotFoundException("user", studentDTO.getUser().getId());
        }
        if(!courseRepository.existsById(studentDTO.getCourse().getCourse_id())){
            throw new NotFoundException("course", studentDTO.getCourse().getCourse_id());
        }
        if(studentDTO == null){
            throw new BadRequestException("studentDTO cannot be null");
        }
        Student student = new Student();
        student.setUser(new Users(studentDTO.getUser()));
        student.setCourse(new Course(studentDTO.getCourse()));
        studentRepository.save(student);
    }

    public void deleteStudentForCourse(Long current_id, Long course_id, Long user_id){
        if(!studentRepository.existsByUser_UserId(user_id)){
            throw new NotFoundException("user", user_id);
        }
        studentRepository.deleteStudent(user_id, course_id);
    }
}
