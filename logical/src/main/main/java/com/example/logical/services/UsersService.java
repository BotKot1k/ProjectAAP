package com.example.logical.services;

import com.example.logical.dto.UsersDTO;
import com.example.logical.entity.Users;
import com.example.logical.exception.BadRequestException;
import com.example.logical.exception.ConflictException;
import com.example.logical.exception.NotFoundException;
import com.example.logical.repositories.UserRepository;
import com.example.logical.security.Action;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class UsersService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PermissionService permissionService;

    public void createUser(UsersDTO userDTO) {
        if(userRepository.existsById(userDTO.getId())) {
            throw new ConflictException("users","id",userDTO.getId());
        }

        if(userDTO.getUser_firstName().isEmpty() || userDTO.getUser_lastName().isEmpty() || userDTO.getId() == null) {
            throw new BadRequestException("Incorrect structure");
        }
        Users user = new Users();

        user.setUserId(userDTO.getId());
        user.setUser_firstname(userDTO.getUser_firstName());
        user.setUser_lastname(userDTO.getUser_lastName());
        user.setUser_patronymic(userDTO.getUser_patronymic());
        user.setUser_rank(userDTO.getUser_rank());

        userRepository.save(user);
    }

    public void deleteUser(Long current_id, Long id){ // Добавить проверку по правам (Типо может ли current_id делать это действие)
        if(!userRepository.existsById(id)) {
            throw new NotFoundException("users",id);
        }
        permissionService.check(Action.USERS_DELETE, current_id);
        userRepository.deleteById(id);
    }

    public List<UsersDTO> getAllUsers(Long current_id) {
        permissionService.check(Action.USERS_GET_ALL, current_id);
        return userRepository.findAll().stream().map(UsersDTO::new).collect(Collectors.toList());
    }

    public UsersDTO findCurrentUser(Long current_id, Long id){
        if(!userRepository.existsById(id)) {
            throw new NotFoundException("users",id);
        }
        permissionService.check(Action.USERS_GET_ONE, current_id);
        Users user = userRepository.findByUserId(id).get(); // Мб тут будет ошибка

        return new UsersDTO(user);
    }

    public void updateUser(Long current_id, UsersDTO userDTO) {
        if(!userRepository.existsById(userDTO.getId())) {
            throw new NotFoundException("users",userDTO.getId());
        }
        permissionService.check(Action.USERS_UPDATE, current_id);
        Users user = userRepository.findByUserId(userDTO.getId()).get();

        if(userDTO.getUser_firstName() != null) {
            user.setUser_firstname(userDTO.getUser_firstName());
        }
        if(userDTO.getUser_lastName() != null) {
            user.setUser_lastname(userDTO.getUser_lastName());
        }
        if(userDTO.getUser_patronymic() != null) {
            user.setUser_patronymic(userDTO.getUser_patronymic());
        }
        if (userDTO.getUser_rank() != null) {

            Set<String> currentUserRanks = user.getUser_rank();
            Set<String> newUserRanks = userDTO.getUser_rank();

            Set<String> mergedRanks = new HashSet<>();

            if (currentUserRanks != null) {
                mergedRanks.addAll(Arrays.asList(currentUserRanks.toString()));
            }

            mergedRanks.addAll(Arrays.asList(newUserRanks.toString()));

            user.setUser_rank(mergedRanks);
        }

    }
}
