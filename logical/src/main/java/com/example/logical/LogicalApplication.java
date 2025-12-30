package com.example.logical;

import com.example.logical.dto.QuestionDTO;
import com.example.logical.dto.TestDTO;
import com.example.logical.dto.Test_questionDTO;
import com.example.logical.entity.Question;
import com.example.logical.entity.Test;
import com.example.logical.entity.Test_question;
import com.example.logical.entity.Users;
import com.example.logical.repositories.QuestionRepository;
import com.example.logical.repositories.TestRepository;
import com.example.logical.repositories.UserRepository;
import com.example.logical.services.Test_questionService;
import jakarta.transaction.Transactional;
import org.apache.catalina.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class LogicalApplication {

    public static void main(String[] args) {
        SpringApplication.run(LogicalApplication.class, args);
    }

}

