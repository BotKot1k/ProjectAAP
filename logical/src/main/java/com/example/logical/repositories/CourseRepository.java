package com.example.logical.repositories;

import com.example.logical.entity.Course;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query(value = "SELECT * FROM course WHERE course_id = ?1", nativeQuery = true)
    Optional<Course> findByCourseId(Long course_id);

    @Query(value = "SELECT * FROM course", nativeQuery = true)
    List<Course> findAllCourses();

    @Modifying
    @Transactional
    @Query(value = "UPDATE course SET description = :value WHERE course_id = :id", nativeQuery = true)
    void updateDescription(@Param("id") Long id, @Param("value") String value);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM course WHERE course_id = :id", nativeQuery = true)
    void deleteCourse(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO course (teacher_id, course_id, description, course_name) VALUES (:teacher_id, :course_id, :description, :course_name", nativeQuery = true)
    void deleteUser(@Param("teacher_id") Long teacher_id, @Param("course_id") Long id, @Param("description") String description, @Param("course_name") String course_name);
}
