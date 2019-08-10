import React, { Component } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";

import { Provider } from "react-redux";
import store from "./store";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Landing from "./components/layout/Landing";

import Layout from "./components/Layout";

import "./index.css";

var NotFound = ({ match }) => (
  <div>Sorry But The Page {match.url} was not found</div>
);

class App extends Component {
  constructor(props) {
    super();

    this.state = {
      isFull: false
    };
  }

  goFull = () => {
    this.setState({ isFull: true });
  };

  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            {/*<Navbar />
            <Route exact path="/" component={Landing} />

            <Footer />*/}
            <Layout />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
