package com.example.logical.security;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;

@Component
public class RolePermissionMap {
    private static final Set<Action> STUDENT_ACTIONS = Set.of(

            Action.COURSE_GET_ONE,
            Action.COURSE_GET_ALL,

            Action.TEST_GET_ONE,
            Action.TEST_GET_ALL,

            Action.QUESTION_GET_ONE,
            Action.QUESTION_GET_ALL,

            // тестирование
            Action.TEST_START,
            Action.TEST_SUBMIT,
            Action.TEST_RESULT_READ,
            Action.STUDENT_GET_ALL_USER_COURSES
    );


    private static final Set<Action> TEACHER_ACTIONS = Set.of(

            Action.USERS_GET_ALL,
            Action.USERS_GET_ONE,

            Action.COURSE_GET_ONE,
            Action.COURSE_GET_ALL,
            Action.COURSE_CREATE,
            Action.COURSE_UPDATE,
            Action.COURSE_DELETE,
            Action.COURSE_ADD_STUDENT,
            Action.COURSE_REMOVE_STUDENT,

            Action.TEST_GET_ONE,
            Action.TEST_GET_ALL,
            Action.TEST_CREATE,
            Action.TEST_UPDATE,
            Action.TEST_DELETE,

            Action.QUESTION_GET_ONE,
            Action.QUESTION_GET_ALL,
            Action.QUESTION_CREATE,
            Action.QUESTION_UPDATE,
            Action.QUESTION_DELETE,

            Action.TEST_QUESTION_ADD,
            Action.TEST_QUESTION_REMOVE,
            Action.COURSE_TEST_ADD,
            Action.COURSE_TEST_REMOVE,

            Action.TEST_RESULT_READ
    );



    private static final Set<Action> ADMIN_ACTIONS = Set.of(
            Action.values() // админ может всё
    );


    private static final Map<String, Set<Action>> ROLE_ACTIONS = Map.of(
            "Student", STUDENT_ACTIONS,
            "Teacher", TEACHER_ACTIONS,
            "Admin", ADMIN_ACTIONS
    );

    /* ===================== API ===================== */

    public boolean isAllowed(Set<String> roles, Action action) {

        return roles.stream()
                .map(ROLE_ACTIONS::get)
                .filter(actions -> actions != null)
                .anyMatch(actions -> actions.contains(action));
    }
}
