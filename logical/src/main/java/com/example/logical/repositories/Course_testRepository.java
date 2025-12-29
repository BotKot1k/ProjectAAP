package com.example.logical.repositories;

import com.example.logical.entity.Course;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Course_testRepository extends JpaRepository<Course, Long> {

    @Query(value = "SELECT t.test_name, ct.course_test_active FROM course_test ct JOIN test t ON ct.test_id = = :course_id AND t.test_id = :course_id", nativeQuery = true)
    List<Object[]> findAllByTest(@Param("course_id") Long course_id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM course_test WHERE user_id = :user_id", nativeQuery = true)
    void deleteСourse_test(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO course_test (course_id, test_id, course_test_active) VALUES (:course_id, :test_id, TRUE", nativeQuery = true)
    void createCourseTest(@Param("course_id") Long course_id, @Param("test_id") Long test_id);
}
