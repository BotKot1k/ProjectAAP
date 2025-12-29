package com.example.logical.repositories;

import com.example.logical.entity.Test_question;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface Test_questionRepository extends JpaRepository<Test_question, Long> {
    @Query(value = "SELECT tq.question_id, q.question_name, q.answer_true, q.question_answer FROM test_question tq JOIN question q ON tq.question_id = q.question_id WHERE tq.test_id = :id", nativeQuery = true)
    List<Object[]> findAllQuestions(@Param("id") Long test_id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM test_question WHERE question_id = :user_id AND test_id = :test_id", nativeQuery = true)
    void deleteQuestion(@Param("id") Long id, @Param("test_id") Long test_id);

    boolean existsByTestId(long test_id);
    /*@Modifying
    @Transactional
    @Query(value = "INSERT INTO test_question ")*/ // Добавить счётчик max user_id
}
