package com.example.logical.repositories;

import com.example.logical.entity.User_test_assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface User_test_assessmentRepository extends JpaRepository<User_test_assessment, Long> {
    @Query(value = "SELECT test_assessment FROM user_test_assessment WHERE course_id = :course_id AND test_id = :test_id AND user_id = :user_id", nativeQuery = true)
    List<Integer> findAllAssessmentUser(@Param("course_id") long course_id, @Param("test_id")long test_id, @Param("id")long user_id);

    @Query(value = "SELECT u.firstname, u.lastname FROM user_test_assessment uta JOIN users u ON uta.user_id = u.user_id WHERE uta.test_id = :user_id", nativeQuery = true)
    List<Object[]> findAllUser(@Param("id") long test_id);

    @Query(value = "SELECT user_answer FROM user_test_assessment WHERE test_id = :test_id AND user_id = :user_id", nativeQuery = true)
    Integer[] findUserAssessment(@Param("test_id") long test_id, @Param("id") long user_id);
}
