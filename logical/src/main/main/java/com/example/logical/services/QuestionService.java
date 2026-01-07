package com.example.logical.services;

import com.example.logical.dto.QuestionDTO;
import com.example.logical.entity.Question;
import com.example.logical.exception.BadRequestException;
import com.example.logical.exception.NotFoundException;
import com.example.logical.repositories.QuestionRepository;
import com.example.logical.security.Action;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private PermissionService permissionService;
    public void changeQuestionName(Long current_id, String new_question_name, Long question_id) {
        if(new_question_name == null || new_question_name.equals("")){
            throw new BadRequestException("Question name can't be empty");
        }
        if(question_id == null || question_id == 0){
            throw new BadRequestException("Question id can't be empty");
        }

        if(!questionRepository.existsById(question_id)) {
            throw new NotFoundException("question", question_id);
        }
        permissionService.check(Action.QUESTION_UPDATE, current_id);
        questionRepository.updateQuestionName(new_question_name, question_id);
    }

    public Long newQuestion(Long current_id, QuestionDTO questionDTO) {
        if(questionDTO == null){
            throw new BadRequestException("Question can't be empty");
        }
        if(questionDTO.getAnswer_true() > 4){
            throw new BadRequestException("Answer can't be less than 5");
        }
        permissionService.check(Action.QUESTION_CREATE, current_id);
        Question question = new Question();
        question.setQuestion_name(questionDTO.getQuestion_name());
        question.setAnswer_true(questionDTO.getAnswer_true());
        question.setQuestion_answer(questionDTO.getQuestion_answer());
        questionRepository.save(question);
        return question.getQuestionId();
    }

    public void deleteQuestion(Long current_id, Long question_id) {
        if(!questionRepository.existsById(question_id)) {
            throw new NotFoundException("question", question_id);
        }
        permissionService.check(Action.QUESTION_DELETE, current_id);
        questionRepository.deleteById(question_id);
    }
}
