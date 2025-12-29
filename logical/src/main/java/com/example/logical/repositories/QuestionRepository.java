package com.example.logical.repositories;

import com.example.logical.entity.Question;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    @Modifying
    @Transactional
    @Query(value = "UPDATE question SET question_name = :value WHERE question_id = :user_id", nativeQuery = true)
    public void updateQuestionName(@Param("value") String value, @Param("id") Long id);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM question WHERE question_id = :user_id", nativeQuery = true)
    public void deleteQuestion(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO question (question_id, question_name, question_answer, answer_true) VALUES (:user_id, :question_name, :question_answer, :answer_true)", nativeQuery = true)
    public void newQuestion(@Param("question_answer") String[] question_answer, @Param("answer_true") String answer_true, @Param("id") Long id, @Param("question_name") String question_name);


}