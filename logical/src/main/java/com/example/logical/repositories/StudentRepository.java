package com.example.logical.repositories;

import com.example.logical.entity.Student;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO student (user_id, course_id) VALUES (:user_id, :course_id)", nativeQuery = true)
    void createAnyStudent(@Param("user_id") Long user_id, @Param("course_id") Long course_id);

    @Query(value = "SELECT s.user_id, u.user_firstname, u.user_lastname FROM student s JOIN users u ON s.user_id = u.user_id", nativeQuery = true)
    List<Object[]> findAllStudents();

    @Query(value = "SELECT s.course_id, c.course_name FROM student s JOIN course c ON s.course_id = c.course_id WHERE user_id = :user_id", nativeQuery = true)
    List<Object[]> findAllUserCourses(@Param("user_id") Long user_id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM student WHERE user_id = :user_id AND course_id = :course_id", nativeQuery = true)
    void deleteStudent(@Param("user_id") Long user_id, @Param("course_id") Long course_id);

    boolean existsByCourse_CourseId(Long course_id);
    boolean existsByUser_UserId(Long userId);
}
