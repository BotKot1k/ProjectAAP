package com.example.logical.security;

public enum Action {
    USERS_GET_ALL,          // getAllUsers
    USERS_GET_ONE,          // findCurrentUser
    USERS_UPDATE,           // updateUser
    USERS_DELETE,           // deleteUser
    USERS_CREATE,           // createUser

    STUDENT_GET_ONE,        // getStudent
    STUDENT_GET_ALL,        // getAllStudents
    STUDENT_CREATE,         // createStudent
    STUDENT_UPDATE,         // updateStudent
    STUDENT_DELETE,         // deleteStudent
    STUDENT_GET_ALL_USER_COURSES,

    COURSE_GET_ONE,         // getCourse
    COURSE_GET_ALL,         // getAllCourses
    COURSE_CREATE,          // createCourse
    COURSE_UPDATE,          // updateCourse
    COURSE_DELETE,          // deleteCourse

    COURSE_ADD_STUDENT,     // addStudentToCourse
    COURSE_REMOVE_STUDENT,  // removeStudentFromCourse

    QUESTION_GET_ONE,       // getQuestion
    QUESTION_GET_ALL,       // getAllQuestions
    QUESTION_CREATE,        // createQuestion
    QUESTION_UPDATE,        // updateQuestion
    QUESTION_DELETE,        // deleteQuestion

    TEST_GET_ONE,           // getTest
    TEST_GET_ALL,           // getAllTests
    TEST_CREATE,            // createTest
    TEST_UPDATE,            // updateTest
    TEST_DELETE,            // deleteTest

    TEST_QUESTION_ADD,      // addQuestionToTest
    TEST_QUESTION_REMOVE,   // removeQuestionFromTest

    COURSE_TEST_ADD,        // addTestToCourse
    COURSE_TEST_REMOVE,     // removeTestFromCourse

    TEST_START,             // createUserTestAssessment
    TEST_SUBMIT,            // updateUserTestAssessment
    TEST_RESULT_READ        // getUserTestAssessment

}
