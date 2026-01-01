package com.example.logical.repositories;

import com.example.logical.entity.User_test_assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface User_test_assessmentRepository extends JpaRepository<User_test_assessment, Long> {
    @Query(value = "SELECT test_id, test_assessment FROM user_test_assessment WHERE course_id = :course_id AND test_id = :test_id AND user_id = :user_id", nativeQuery = true)
    List<Object[]> findAllAssessmentUser(@Param("course_id") Long course_id, @Param("test_id") Long test_id, @Param("user_id") Long user_id);

    @Query(value = "SELECT u.firstname, u.lastname FROM user_test_assessment uta JOIN users u ON uta.user_id = u.user_id WHERE uta.test_id = :test_id AND uta.course_id = :course_id", nativeQuery = true)
    List<Object[]> findAllUser(@Param("test_id") Long test_id, @Param("course_id") Long course_id);

    @Query(value = """
    SELECT 
        q.question_name,
        uta.user_answer
    FROM test_question tq
    INNER JOIN question q ON tq.questionId = q.questionId
    LEFT JOIN user_test_assessment uta ON 
        tq.test_id = uta.test_id 
        AND tq.questionId = uta.question_id
        AND uta.user_id = :user_id
    WHERE tq.test_id = :test_id
    ORDER BY tq.question_number
    """, nativeQuery = true)
    List<Object[]> findQuestionNamesWithUserAnswers(@Param("test_id") Long test_id, @Param("user_id") Long user_id);

    //boolean existsByStudent_UserId(Long user_id);
    boolean existsByTest_TestId(Long test_id);
    boolean existsByCourse_CourseId(Long course_id);
}
