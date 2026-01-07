package com.example.logical.services;

import com.example.logical.dto.Test_questionDTO;
import com.example.logical.entity.Question;
import com.example.logical.entity.Test;
import com.example.logical.entity.Test_question;
import com.example.logical.exception.BadRequestException;
import com.example.logical.exception.NotFoundException;
import com.example.logical.repositories.QuestionRepository;
import com.example.logical.repositories.TestRepository;
import com.example.logical.repositories.Test_questionRepository;
import com.example.logical.security.Action;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class Test_questionService {
    @Autowired
    private Test_questionRepository test_questionRepository;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private PermissionService permissionService;
    public List<Object[]>  findAllQuestions(Long current_id, Long test_id) {
        if(!test_questionRepository.existsByTest_TestId(test_id)){
            throw new NotFoundException("Test_question", test_id);
        }
        permissionService.check(Action.QUESTION_GET_ALL, current_id);
        return test_questionRepository.findAllQuestions(test_id);
    }

    public void createTestQuestion(Long current_id, Test_questionDTO test_questionDTO) {
        if(test_questionDTO == null){
            throw new BadRequestException("Test_questionDTO is null");
        }
        if(!testRepository.existsById(test_questionDTO.getTest_id())){
            throw new NotFoundException("Test_question ", test_questionDTO.getTest_id());
        }
        if(!questionRepository.existsById(test_questionDTO.getQuestion_id())){
            throw new NotFoundException("question ", test_questionDTO.getQuestion_id());
        }
        permissionService.check(Action.QUESTION_CREATE, current_id);
        Test_question test_question;

        test_question = new Test_question();  // Создаем новый

        test_question.setQuestion_number(test_questionDTO.getQuestion_number());
        test_question.setTest(testRepository.findTestByIdNoOptional(test_questionDTO.getTest_id()));
        test_question.setQuestion(questionRepository.findQuestionByIdNoOptional(test_questionDTO.getQuestion_id()));
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
        permissionService.check(Action.QUESTION_DELETE, current_id);
        test_questionRepository.deleteQuestion(question_id, test_id);
    }

    public void changeQuestionNumber(Long current_id, Long test_id, Long question_id, Integer new_question_number) {
        if(!test_questionRepository.existsByTest_TestId(test_id)){
            throw new NotFoundException("Test", test_id);
        }
        if(!test_questionRepository.existsByQuestion_QuestionId(question_id)){
            throw new NotFoundException("Question", question_id);
        }
        if (new_question_number > test_questionRepository.getMaxQuestionNumber(test_id)) {
            throw new BadRequestException("New question number is greater than test question number");
        }
        if (new_question_number < 1){
            throw new BadRequestException("Question number must be greater than 0");
        }
        permissionService.check(Action.QUESTION_UPDATE, current_id);
        test_questionRepository.updateQuestionNumber(test_id, new_question_number, question_id);
        test_questionRepository.decrementQuestionNumbersAfter(test_id, new_question_number);
    }
}
