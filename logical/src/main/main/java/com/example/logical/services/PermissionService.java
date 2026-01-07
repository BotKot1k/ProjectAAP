package com.example.logical.services;

import com.example.logical.entity.Users;
import com.example.logical.exception.ForbiddenException;
import com.example.logical.repositories.UserRepository;
import com.example.logical.security.Action;
import com.example.logical.security.RolePermissionMap;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PermissionService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RolePermissionMap rolePermissions;

    public void check(Action action, Long currentUserId) {
        if(!userRepository.existsById(currentUserId)){
            throw new ForbiddenException("CurrentID is not found");
        }
        Users users = userRepository.findByUserIdNotOptional(currentUserId);


        boolean allowed = rolePermissions.isAllowed(users.getUser_rank(), action);

        if (!allowed) {
            throw new ForbiddenException("q");
        }
    }
}
