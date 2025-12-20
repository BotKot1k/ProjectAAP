package com.example.logical;

import com.example.logical.entity.Users;
import com.example.logical.repositories.UserRepository;
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

