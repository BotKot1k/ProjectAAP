package com.example.logical.repositories;

import com.example.logical.entity.Test_question;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface Test_questionRepository extends JpaRepository<Test_question, Long> {
    @Query(value = "SELECT tq.question_id, q.question_name, q.answer_true, q.question_answer FROM test_question tq JOIN question q ON tq.question_id = q.question_id WHERE tq.test_id = :id", nativeQuery = true)
    List<Object[]> findAllQuestions(@Param("id") Long test_id);



    @Modifying
    @Transactional
    @Query(value = "DELETE FROM test_question WHERE question_id = :question_id AND test_id = :test_id", nativeQuery = true)
    void deleteQuestion(@Param("question_id") Long question_id, @Param("test_id") Long test_id);

    @Query(value = "SELECT MAX question_number FROM test_question WHERE test_id = :test_id", nativeQuery = true)
    Integer getMaxQuestionNumber(@Param("test_id") Long test_id);

    @Query(value = "SELECT question_number FROM test_question WHERE test_id = :test_id AND question_id = :questionId", nativeQuery = true)
    Integer getQuestionNumber(@Param("test_id") Long test_id, @Param("questionId") Long question_id);

    @Query(value = "SELECT question_id FROM test_question WHERE test_id = :test_id AND question_number > :current_question_number", nativeQuery = true)
    List<Long> getNextQuestionNumber(@Param("test_id") Long test_id, @Param("current_question_id") Optional<Integer> current_question_number);

    @Modifying
    @Transactional
    @Query(value = "UPDATE test_question SET question_number = question_number - 1 WHERE test_id = :test_id AND question_number > :current_question_number", nativeQuery = true)
    void decrementQuestionNumbersAfter(@Param("test_id") Long testId, @Param("current_question_number") Integer currentQuestionNumber);

    @Modifying
    @Transactional
    @Query(value = "UPDATE test_question SET question_number = :question_number WHERE test_id = :test_id AND question_id = :question_id", nativeQuery = true)
    void updateQuestionNumber(@Param("test_id") Long test_id, @Param("question_number") Integer question_number, @Param("question_id") Long question_id);

    boolean existsByTest_TestId(Long test_id);
    boolean existsByQuestion_QuestionId(Long question_id);
    /*@Modifying
    @Transactional
    @Query(value = "INSERT INTO test_question ")*/ // Добавить счётчик max user_id
}
