const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var fs = require("fs");
const passport = require("passport");

var dateFormat = require("dateformat");

const nodemailer = require("nodemailer");

const multer = require("multer");
const path = require("path");

// Load User model
const User = require("./models/User");
// Load Matcheduserlist model
const Matcheduserlist = require("./models/Matcheduserlist");
// Load Communitychats model
const Communitychats = require("./models/Communitychats");

const io = require("./mychatserver.js").io;

const {
  VERIFY_USER,
  USER_CONNECTED,
  USER_DISCONNECTED,
  LOGOUT,
  COMMUNITY_CHAT,
  COMMUNITY_CHAT_HISTORY,
  MESSAGE_RECIEVED,
  MESSAGE_SENT,
  TYPING,
  PRIVATE_MESSAGE
} = require("./client/src/Events");

const {
  createUser,
  createMessage,
  createChat
} = require("./client/src/Factories");

let connectedUsers = {};

let communityChat = createChat({ isCommunity: true });

module.exports = function(socket) {
  // console.log('\x1bc'); //clears console

  console.log("New user connected where Socket Id:" + socket.id);

  let sendMessageToChatFromUser;

  let sendTypingFromUser;

  //listen on VERIFY_USER
  //Verify Username
  socket.on(VERIFY_USER, (nickname, callback) => {
    console.log("listen on VERIFY_USER");
    if (isUser(connectedUsers, nickname)) {
      callback({ isUser: true, user: null });
    } else {
      callback({
        isUser: false,
        user: createUser({ name: nickname, socketId: socket.id })
      });
    }
  });

  //In order to send an event to everyone, Socket.IO gives us the io.emit

  //listen on USER_CONNECTED
  //User Connects with username
  socket.on(USER_CONNECTED, user => {
    console.log("listen on USER_CONNECTED");
    user.socketId = socket.id;
    connectedUsers = addUser(connectedUsers, user);
    socket.user = user;

    sendMessageToChatFromUser = sendMessageToChat(user.name);
    sendTypingFromUser = sendTypingToChat(user.name);

    //it will broadcast the new user connected list to all the connected users from our socket server in case always when new user is connected

    //thats why in the section of connected user left tab users list is always up to date
    io.emit(USER_CONNECTED, connectedUsers);
    console.log(connectedUsers);
  });

  socket.on(COMMUNITY_CHAT_HISTORY, callback => {
    console.log("listen on COMMUNITY_CHAT_HISTORY");

    Communitychats.find({}).then(communitychats => {
      //res.json(communitychats);
      console.log("communitychats history found!!");
      callback(communitychats);
    });
  });

  socket.on(COMMUNITY_CHAT, callback => {
    console.log("listen on COMMUNITY_CHAT");
    console.log(communityChat);
    callback(communityChat);
  });

  //Each socket also fires a special disconnect event
  //User disconnects
  socket.on("disconnect", () => {
    console.log("listen on disconnect");
    if ("user" in socket) {
      console.log(
        "disconnected user is remove from our socket connectedUsers object list"
      );

      connectedUsers = removeUser(connectedUsers, socket.user.name);

      console.log("here we broadcast final connected users list");

      io.emit(USER_DISCONNECTED, connectedUsers);
      console.log("Final Connected Users are : ", connectedUsers);
    }
  });

  //listen on LOGOUT
  //User logout
  socket.on(LOGOUT, () => {
    console.log("listen on LOGOUT");

    connectedUsers = removeUser(connectedUsers, socket.user.name);
    io.emit(USER_DISCONNECTED, connectedUsers);
    console.log("Disconnect", connectedUsers);
  });

  //Get Community Chat
  socket.on(COMMUNITY_CHAT, callback => {
    console.log("listen on COMMUNITY_CHAT");
    console.log(communityChat);
    callback(communityChat);
  });

  //listen on MESSAGE_SENT
  socket.on(MESSAGE_SENT, ({ chatId, message }) => {
    console.log("listen on MESSAGE_SENT");
    console.log("chatid is : " + chatId + " where message is : " + message);

    sendMessageToChatFromUser(chatId, message);
  });

  socket.on(TYPING, ({ chatId, isTyping }) => {
    console.log("listen on TYPING");

    sendTypingFromUser(chatId, isTyping);
  });

  socket.on(PRIVATE_MESSAGE, ({ reciever, sender, activeChat }) => {
    console.log("listen on PRIVATE_MESSAGE");
    if (reciever in connectedUsers) {
      console.log("reciever is : " + reciever + " and sender is : " + sender);

      const recieverSocket = connectedUsers[reciever].socketId;

      console.log("recieverSocket is : " + recieverSocket);

      if (activeChat === null || activeChat.id === communityChat.id) {
        console.log(
          "activeChat === null || activeChat.id === communityChat.id"
        );

        const newChat = createChat({
          name: `${reciever}&${sender}`,
          users: [reciever, sender]
        });

        // sending to individual socketid (private message)
        //eg: socket.to(socket.id).emit('hey', 'I just met you');

        //newChat means freash chats of two private users

        console.log("private fresh chat is : " + newChat.id);

        socket.to(recieverSocket).emit(PRIVATE_MESSAGE, newChat);
        socket.emit(PRIVATE_MESSAGE, newChat);
      } else {
        //activeChat means prev chats of two private users
        console.log("activeChat || activeChat.id != communityChat.id");

        socket.to(recieverSocket).emit(PRIVATE_MESSAGE, activeChat);
      }
    }
  });
};
/*
 * Returns a function that will take a chat id and a boolean isTyping
 * and then emit a broadcast to the chat id that the sender is typing
 * @param sender {string} username of sender
 * @return function(chatId, message)
 */
function sendTypingToChat(user) {
  return (chatId, isTyping) => {
    io.emit(`${TYPING}-${chatId}`, { user, isTyping });
  };
}

/*
 * Returns a function that will take a chat id and message
 * and then emit a broadcast to the chat id.
 * @param sender {string} username of sender
 * @return function(chatId, message)
 */
function sendMessageToChat(sender) {
  return (chatId, message) => {
    io.emit(
      `${MESSAGE_RECIEVED}-${chatId}`, //MESSAGE_RECIEVED event
      createMessage({ message, sender }),
      sendMessageToChatSAVE(chatId, message, sender)
    );
  };
}

function sendMessageToChatSAVE(chatId, message, sender) {
  //console.log("communityChat.isCommunity is : " + communityChat.id);

  //console.log("chatId inside sendMessageToChatSAVE is : " + chatId);
  if (chatId === communityChat.id) {
    //if chatId equal to community chat id
    console.log("we are saving communityChat messages!!");
    console.log("here we save chat in database!!");
    const newCommunitychats = new Communitychats({
      id: chatId,
      time: getTime(new Date(Date.now())),
      message: message,
      sender
    });

    newCommunitychats
      .save()
      .then(newCommunitychats => {
        console.log("chat saved successfully!!");
      }) //here we send back new user register information as a response from the success server side
      .catch(err => {
        console.log("chat saved error is :" + err);
      });
  } else {
    console.log("we cannot save private message!!");

    //console.log("chatId inside sendMessageToChatSAVE is : " + chatId);
  }
}

/*
 * Adds user to list passed in.
 * @param userList {Object} Object with key value pairs of users
 * @param user {User} the user to added to the list.
 * @return userList {Object} Object with key value pairs of Users
 */
function addUser(userList, user) {
  let newList = Object.assign({}, userList);
  newList[user.name] = user;
  return newList;
}

/*
 * Removes user from the list passed in.
 * @param userList {Object} Object with key value pairs of Users
 * @param username {string} name of user to be removed
 * @return userList {Object} Object with key value pairs of Users
 */
function removeUser(userList, username) {
  let newList = Object.assign({}, userList);
  delete newList[username];
  return newList;
}

/*
 * Checks if the user is in list passed in.
 * @param userList {Object} Object with key value pairs of Users
 * @param username {String}
 * @return userList {Object} Object with key value pairs of Users
 */
function isUser(userList, username) {
  return username in userList;
}

/*
 *	@param date {Date}
 *	@return a string represented in 24hr time i.e. '11:30', '19:30'
 */
const getTime = date => {
  return `${date.getHours()}:${("0" + date.getMinutes()).slice(-2)}`;
};
