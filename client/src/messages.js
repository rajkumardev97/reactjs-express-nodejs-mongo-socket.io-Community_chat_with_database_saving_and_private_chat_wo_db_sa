import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";

class Messages extends Component {
  render() {
    {
      /*} var messages = {
      sandwich: "turkey",
      chips: "Cape Cod",
      snack: "Cookies",
      drink: "Pepsi",
      calories: 325,
      picnic: true
    };
    */
    }
    let messageContent;

    Object.keys(messages).forEach(function(type) {
      console.log(type); // the key (ex. sandwich)

      messageContent = (
        <div className="alert alert-{type}">
          {messages[type].forEach(function(message) {
            console.log(message);
            <p>{message}</p>;
          })}
        </div>
      );
    });

    return (
      <div className="messages">
        <div className="row">
          <div className="col-md-12">
            <div>
              {messageContent ? (
                { messageContent }
              ) : (
                <h3>Messages is not getting</h3>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Landing.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(Messages);
