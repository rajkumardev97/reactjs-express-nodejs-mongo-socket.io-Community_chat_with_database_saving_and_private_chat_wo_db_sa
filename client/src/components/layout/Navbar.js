import React, { Component } from "react";

import axios from "axios";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cartstockdtall: [],
      cartitemlength: "",
      companylogo: "",
      minqtyreqnotify: null
    };
  }

  componentDidMount() {}
  componentWillReceiveProps(nextProps) {}
  onLogoutClick(e) {
    e.preventDefault();
  }

  render() {
    const guestLinks = (
      /* <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <Link className="nav-link" to="/register">
            Sign Up
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/login">
            Login
          </Link>
        </li>
      </ul>*/
      <ul className="navbar-nav ml-auto">
        <li className="nav-item" />
      </ul>
    );

    return (
      <div className="mainheader-area">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-3">
              <div className="logo" />
            </div>

            {guestLinks}
          </div>
        </div>
      </div>
    );
  }
}

export default Navbar;
