// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const { baseUrl } = Cypress.config();
const { apiUrl } = Cypress.env();

import { authInfo, localStorageRootKey } from '../utils/common';

Cypress.Commands.add('login', function () {
  cy.request("POST", apiUrl + '/auth', {
    email: authInfo.email,
    password: authInfo.passwd
  }).then(res => {
    const token = res.headers['x-auth-token'];
    const storeItem = {
      isLogin: true,
      userId: "5fcaf3eb3c8c5708287edbf5",
      username: 'qweqwe',
      token
    };
    localStorage.setItem(localStorageRootKey, JSON.stringify(storeItem));
  });
});

Cypress.Commands.add("stubLogin", function () {
  cy.intercept("POST", apiUrl + "/auth", {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Origin": baseUrl,
      "Access-Control-Expose-Headers": "x-auth-token",
      "x-auth-token":
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmNhZjNlYjNjOGM1NzA4Mjg3ZWRiZjUiLCJ1c2VybmFtZSI6InF3ZXF3ZSIsImlhdCI6MTYxNzI4NDY1NywiZXhwIjoxNjE5ODc2NjU3fQ.imx3e-UwgLuFgJvSfyYXnzOrJuBKZgChh-dDMeybAcs",
    },
    body: {
      status: "done",
      avatarURL: "/images/avatars/160965973372878c71447d7f70b71",
    },
  });
});

Cypress.Commands.add("stubFavSonglist", function () {
  cy.intercept("POST", apiUrl + "/user/songlist/favedlists", {
    body: {
      status: "done",
    },
  });
  cy.intercept("DELETE", apiUrl + "/user/songlist/favedlists", {
    body: {
      status: "done",
    },
  });
});

Cypress.Commands.add("stubFavTrack", function () {
  cy.intercept("POST", apiUrl + "/user/songlist/favedTrack", {
    body: {
      status: "done",
    },
  });
});

Cypress.Commands.add("stubComment", function (comment) {
  cy.intercept("POST", apiUrl + "/songlist/comment", {
    body: {
      status: "done",
      comment: {
        like: 0,
        _id: "60404e674b871b06be1a4702",
        comment: comment,
        user: {
          _id: "5fcaf3eb3c8c5708287edbf5",
          username: "qweqwe",
          avatarURL: "/images/avatars/160965973372878c71447d7f70b71",
        },
      },
      total: 1,
    },
  });
});
Cypress.Commands.add("stubReplyComment", function (reply, comment) {
  cy.intercept("POST", apiUrl + "/songlist/comment", {
    status: "done",
    comment: {
      like: 0,
      _id: "6040a3604b871b06be1a4708",
      comment: reply,
      user: {
        _id: "5fcaf3eb3c8c5708287edbf5",
        username: "qweqwe",
        avatarURL: "/images/avatars/160965973372878c71447d7f70b71",
      },
      replyTo: {
        like: 0,
        _id: "6040a3514b871b06be1a4706",
        comment: comment,
        user: {
          _id: "5fcaf3eb3c8c5708287edbf5",
          username: "qweqwe",
          avatarURL: "/images/avatars/160965973372878c71447d7f70b71",
        },
        createdAt: "2021-03-04T09:07:29.955Z",
        updatedAt: "2021-03-04T09:07:29.955Z",
      },
    },
    total: 2,
  });
});

Cypress.Commands.add('stubPrivateMessage', function (sessionCount = 1) {
  let sessionData = { "newMessage": 0, "isDelete": false, "_id": 0, "talkingTo": { "_id": "5fef27efd6e53a4e34b52fa8", "username": "test", "avatarURL": "/images/avatars/16095980769383e210176f3bd2440" }, "dataRef": { "_id": "600bf63443d16930f8038629", "lastMessage": { "_id": "601146ce8695bf2b98c478b0", "message": "6", "user": "5fcaf3eb3c8c5708287edbf5", "createdAt": "2021-01-27T10:56:14.809Z", "updatedAt": "2021-01-27T10:56:14.809Z" } }, "createdAt": "2021-01-23T10:11:00.565Z", "updatedAt": "2021-01-23T15:23:32.099Z", "__v": 0 };
  let sessionList = [];
  let i = 0;
  while (i < sessionCount) {
    sessionData["_id"] = i;
    sessionList = sessionList.concat({ ...sessionData });
    i++;
  }
  cy.intercept("GET", apiUrl + "/message/privateMessage/data?userId=*", {
    status: "done",
    data: [
      { "_id": "600bf63443d16930f8038628", "message": "1 foo", "user": "5fcaf3eb3c8c5708287edbf5", "createdAt": "2021-01-23T10:11:00.557Z", "updatedAt": "2021-01-23T10:11:00.557Z" },
    ]
  });
  cy.intercept("GET", apiUrl + "/message/privateMessage", {
    "status": "done",
    "privateMessageList": sessionList
  });
  cy.intercept("POST", apiUrl + "/message/privateMessage/data",
    (req) => {
      req.reply(
        { "status": "done", "sessionData": { "_id": "609e7834eaebbb7d706b76b7", "message": req.body.message, "user": "5fcaf3eb3c8c5708287edbf5", "updatedAt": "2021-05-14T13:22:36.548Z" }, "dataListId": "600bf63443d16930f8038629" }
      );
    }
  );
});
