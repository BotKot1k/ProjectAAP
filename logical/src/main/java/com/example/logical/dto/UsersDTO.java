package com.example.logical.dto;

import com.example.logical.entity.Users;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UsersDTO {
    private Long id;
    private String user_firstName;
    private String user_lastName;
    private String user_patronymic;
    private String[] user_rank;

    public UsersDTO(Users user){
        id = user.getUser_id();
        this.user_firstName = user.getUser_firstname();
        this.user_lastName = user.getUser_lastname();
        this.user_patronymic = user.getUser_patronymic();
        this.user_rank = user.getUser_rank();
    }
}
