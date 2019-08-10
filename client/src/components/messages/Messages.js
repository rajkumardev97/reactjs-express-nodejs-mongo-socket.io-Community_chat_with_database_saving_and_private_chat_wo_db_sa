import React, { Component } from "react";

export default class Messages extends Component {
  constructor(props) {
    super(props);

    this.scrollDown = this.scrollDown.bind(this);
  }

  scrollDown() {
    //it will let you down of the chat container so we will see always latest message on our screen
    const { container } = this.refs;
    container.scrollTop = container.scrollHeight;
  }

  componentDidMount() {
    this.scrollDown();
  }

  componentDidUpdate(prevProps, prevState) {
    this.scrollDown();
  }

  render() {
    const { messages, user, typingUsers, commchathistory } = this.props;

    var historychats;

    if (commchathistory === null) {
      console.log("commchathistory is null!!");
    } else {
      console.log("commchathistory is set!!");

      historychats = commchathistory.map(mes => {
        return (
          <div
            key={mes.id}
            className={`message-container ${mes.sender === user.name &&
              "right"}`}
          >
            <div className="time">{mes.time}</div>
            <div className="data">
              <div className="message">{mes.message}</div>
              <div className="name">{mes.sender}</div>
            </div>
          </div>
        );
      });
    }
    return (
      <div ref="container" className="thread-container">
        <div className="thread">
          {messages.map((mes, index) => {
            return (
              <div
                key={index}
                className={`message-container ${mes.sender === user.name &&
                  "right"}`}
              >
                <div className="time">{mes.time}</div>
                <div className="data">
                  <div className="message">{mes.message}</div>
                  <div className="name">{mes.sender}</div>
                </div>
              </div>
            );
          })}
          {typingUsers.map(name => {
            return (
              <div key={name} className="typing-user">
                {`${name} is typing . . .`}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
