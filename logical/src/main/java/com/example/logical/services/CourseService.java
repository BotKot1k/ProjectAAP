package com.example.logical.services;

import com.example.logical.dto.CourseDTO;
import com.example.logical.entity.Course;
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
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;


    public CourseDTO getCourseById(Long current_id, Long id) {
        Course course = courseRepository.findByCourseId(id).orElseThrow(() -> new NotFoundException("Course", id));
        return new CourseDTO(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAllCourses();
    }

    public void updateDescription(Long current_id,Long course_id, String description) {
        if(!courseRepository.existsById(course_id)) {
            throw new NotFoundException("Course", course_id);
        }

        if(description == null){
            throw new BadRequestException("description");
        }

        courseRepository.updateDescription(course_id,description);
    }

    public void deleteCourseById(Long current_id, Long course_id) {
        if(!courseRepository.existsById(course_id)) {
            throw new NotFoundException("Course", course_id);
        }

        courseRepository.deleteCourse(course_id);
    }

    public void createCourse(CourseDTO courseDTO) {
        Course course = new Course();

        course.setCourse_name(courseDTO.getCourse_name());
        course.setTeacher(new Users(courseDTO.getTeacher_id()));
        course.setDescription(courseDTO.getDescription());
        courseRepository.save(course);
    }
}
