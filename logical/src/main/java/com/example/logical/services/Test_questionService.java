package com.example.logical.services;

import com.example.logical.dto.Test_questionDTO;
import com.example.logical.entity.Question;
import com.example.logical.entity.Test;
import com.example.logical.entity.Test_question;
import com.example.logical.exception.BadRequestException;
import com.example.logical.exception.NotFoundException;
import com.example.logical.repositories.Test_questionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class Test_questionService {
    @Autowired
    private Test_questionRepository test_questionRepository;

    public List<Object[]>  findAllQuestions(Long current_id, Long test_id) {
        if(!test_questionRepository.existsByTest_TestId(test_id)){
            throw new NotFoundException("Test_question", test_id);
        }
        return test_questionRepository.findAllQuestions(test_id);
    }

    public void createTestQuestion(Long current_id, Test_questionDTO test_questionDTO) {
        if(test_questionDTO == null){
            throw new BadRequestException("Test_questionDTO is null");
        }
        Test_question test_question;
        if(test_questionDTO.getId() != null){
            test_question = test_questionRepository.findById(test_questionDTO.getId())
                    .orElse(new Test_question());
            test_question.setId(test_questionDTO.getId());
        } else {
            test_question = new Test_question();  // Создаем новый
        }
        test_question.setQuestion_number(test_questionDTO.getQuestion_number());
        test_question.setTest(new Test(test_questionDTO.getTest()));
        test_question.setQuestion(new Question(test_questionDTO.getQuestion()));
        test_questionRepository.save(test_question);
    }

    public void deleteTestQuestion(Long current_id, Long test_id, Long question_id) {
        if(!test_questionRepository.existsByTest_TestId(test_id)){
            throw new NotFoundException("Test", test_id);
        }
        else if(!test_questionRepository.existsByQuestion_QuestionId(question_id)){
            throw new NotFoundException("Question", question_id);
        }

        if(test_questionRepository.getQuestionNumber(test_id, question_id) != test_questionRepository.getMaxQuestionNumber(test_id)){
            Integer currentQuestionNumber = test_questionRepository.getQuestionNumber(test_id, question_id);
            test_questionRepository.decrementQuestionNumbersAfter(test_id, currentQuestionNumber);
        }
        test_questionRepository.deleteQuestion(question_id, test_id);
    }

    public void changeQuestionNumber(Long current_id, Test_questionDTO test_questionDTO) {
        if(!test_questionRepository.existsByTest_TestId(test_questionDTO.getTest().getTest_id())){
            throw new NotFoundException("Test", test_questionDTO.getTest().getTest_id());
        }
        if(!test_questionRepository.existsByQuestion_QuestionId(test_questionDTO.getQuestion().getQuestion_id())){
            throw new NotFoundException("Question", test_questionDTO.getQuestion().getQuestion_id());
        }
        if (test_questionDTO.getQuestion_number() > test_questionRepository.getMaxQuestionNumber(test_questionDTO.getTest().getTest_id())) {
            throw new IllegalArgumentException(
                    String.format("Question number %d exceeds maximum allowed value %d for test %d",
                            test_questionDTO.getQuestion_number(), test_questionRepository.getMaxQuestionNumber(test_questionDTO.getTest().getTest_id()))
            );
        }
        if (test_questionDTO.getQuestion_number() < 1){
            throw new BadRequestException("Question number must be greater than 0");
        }

        test_questionRepository.updateQuestionNumber(test_questionDTO.getTest().getTest_id(), test_questionDTO.getQuestion_number(), test_questionDTO.getQuestion().getQuestion_id());
        test_questionRepository.decrementQuestionNumbersAfter(test_questionDTO.getTest().getTest_id(), test_questionDTO.getQuestion_number());
    }
}
