import React, { Component } from "react";
import SideBar from "../sidebar/SideBar";
import {
  COMMUNITY_CHAT,
  COMMUNITY_CHAT_HISTORY,
  MESSAGE_SENT,
  MESSAGE_RECIEVED,
  TYPING,
  PRIVATE_MESSAGE,
  USER_CONNECTED,
  USER_DISCONNECTED
} from "../../Events";
import ChatHeading from "./ChatHeading";
import Messages from "../messages/Messages";
import MessageInput from "../messages/MessageInput";
import { values } from "lodash";

export default class ChatContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chats: [],
      users: [],
      activeChat: null,
      commchathistory: null
    };
  }

  componentDidMount() {
    const { socket } = this.props;
    this.initSocket(socket);
  }

  componentWillUnmount() {
    const { socket } = this.props;
    socket.off(PRIVATE_MESSAGE);
    socket.off(USER_CONNECTED);
    socket.off(USER_DISCONNECTED);
  }

  initSocket(socket) {
    socket.emit(COMMUNITY_CHAT_HISTORY, this.resetChatHistory);

    socket.emit(COMMUNITY_CHAT, this.resetChat);
    socket.on(PRIVATE_MESSAGE, this.addChat);

    //Each socket also fires a special connect event
    socket.on("connect", () => {
      console.log("socket connect executed");
      socket.emit(COMMUNITY_CHAT, this.resetChat);
    });

    //listen on USER_CONNECTED
    socket.on(USER_CONNECTED, users => {
      this.setState({ users: values(users) });
    });

    //listen on USER_DISCONNECTED
    socket.on(USER_DISCONNECTED, users => {
      this.setState({ users: values(users) });
    });
  }

  resetChatHistory = historychat => {
    //for new connection here first we retrive the previous chat history then we append the chat.messages to historychat
    console.log("resetChatHistory chat is : " + historychat);

    this.setState({ commchathistory: historychat });

    const { chats, commchathistory } = this.state;

    const historymessages = [...chats[0].messages, ...commchathistory];
    console.log("final chats array is below ");
    console.log(historymessages);

    let newChats = chats.map(chat => {
      chat.messages.length = 0;
      chat.messages = historymessages;
      return chat;
    });

    console.log("newChats value is below:");
    console.log(newChats);
    this.setState({ chats: newChats });

    //  return this.addChat(chat, true);
  };

  sendOpenPrivateMessage = reciever => {
    const { socket, user } = this.props;
    const { activeChat } = this.state;
    console.log("here we emit PRIVATE_MESSAGE");
    socket.emit(PRIVATE_MESSAGE, { reciever, sender: user.name, activeChat });
  };

  /*
   *	Reset the chat back to only the chat passed in.
   * 	@param chat {Chat}
   */
  resetChat = chat => {
    console.log("reset chat is : " + chat);
    return this.addChat(chat, true);
  };

  /*
   *	Adds chat to the chat container, if reset is true removes all chats
   *	and sets that chat to the main chat.
   *	Sets the message and typing socket events for the chat.
   *
   *	@param chat {Chat} the chat to be added.
   *	@param reset {boolean} if true will set the chat as the only chat.
   */
  addChat = (chat, reset = false) => {
    console.log("initialize chat is below ");
    console.log(chat);
    const { socket } = this.props;
    const { chats } = this.state;

    const newChats = reset ? [chat] : [...chats, chat];
    this.setState({
      chats: newChats,
      activeChat: reset ? chat : this.state.activeChat
    });

    const messageEvent = `${MESSAGE_RECIEVED}-${chat.id}`;
    const typingEvent = `${TYPING}-${chat.id}`;

    socket.on(typingEvent, this.updateTypingInChat(chat.id));
    socket.on(messageEvent, this.addMessageToChat(chat.id));
  };

  /*
   * 	Returns a function that will
   *	adds message to chat with the chatId passed in.
   *
   * 	@param chatId {number}
   */
  addMessageToChat = chatId => {
    //chatId=> community chat id or private chat id where we push each send msg object to the our chats state
    console.log("addMessageToChat where chatId is : " + chatId);
    return message => {
      const { chats } = this.state;
      console.log("chats.messages state value is below:");
      console.log(chats[0].messages);
      let newChats = chats.map(chat => {
        console.log("chat.id is : " + chat.id);
        console.log("where msg is below");
        console.log(message);
        if (chat.id === chatId) chat.messages.push(message);
        return chat;
      });
      console.log("newChats value is below:");
      console.log(newChats);
      this.setState({ chats: newChats });
    };
  };

  /*
   *	Updates the typing of chat with id passed in.
   *	@param chatId {number}
   */
  updateTypingInChat = chatId => {
    return ({ isTyping, user }) => {
      if (user !== this.props.user.name) {
        const { chats } = this.state;

        let newChats = chats.map(chat => {
          if (chat.id === chatId) {
            if (isTyping && !chat.typingUsers.includes(user)) {
              chat.typingUsers.push(user);
            } else if (!isTyping && chat.typingUsers.includes(user)) {
              chat.typingUsers = chat.typingUsers.filter(u => u !== user);
            }
          }
          return chat;
        });
        this.setState({ chats: newChats });
      }
    };
  };

  /*
   *	Adds a message to the specified chat
   *	@param chatId {number}  The id of the chat to be added to.
   *	@param message {string} The message to be added to the chat.
   */
  sendMessage = (chatId, message) => {
    const { socket } = this.props;

    console.log("sendMessage where msg is :" + message);

    socket.emit(MESSAGE_SENT, { chatId, message });
  };

  /*
   *	Sends typing status to server.
   *	chatId {number} the id of the chat being typed in.
   *	typing {boolean} If the user is typing still or not.
   */
  sendTyping = (chatId, isTyping) => {
    const { socket } = this.props;
    socket.emit(TYPING, { chatId, isTyping });
  };

  setActiveChat = activeChat => {
    this.setState({ activeChat });
  };
  render() {
    const { user, logout } = this.props;
    const { chats, activeChat, users, commchathistory } = this.state;
    return (
      <div className="container">
        <SideBar
          logout={logout}
          chats={chats}
          user={user}
          users={users}
          activeChat={activeChat}
          setActiveChat={this.setActiveChat}
          onSendPrivateMessage={this.sendOpenPrivateMessage}
        />
        <div className="chat-room-container">
          {activeChat !== null ? (
            <div className="chat-room">
              <ChatHeading name={activeChat.name} />
              <Messages
                messages={activeChat.messages}
                commchathistory={commchathistory}
                user={user}
                typingUsers={activeChat.typingUsers}
              />
              <MessageInput
                sendMessage={message => {
                  this.sendMessage(activeChat.id, message);
                }}
                sendTyping={isTyping => {
                  this.sendTyping(activeChat.id, isTyping);
                }}
              />
            </div>
          ) : (
            <div className="chat-room choose">
              <h3>Choose a chat!</h3>
            </div>
          )}
        </div>
      </div>
    );
  }
}
