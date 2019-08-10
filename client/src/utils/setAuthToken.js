import axios from "axios";

const setAuthToken = token => {
  if (token) {
    //if token is exist after successfully login
    // then token is Apply to every request in Authorization header
    axios.defaults.headers.common["Authorization"] = token;
  } else {
    //if token is not exist after login
    // Delete auth header
    delete axios.defaults.headers.common["Authorization"];
  }
};

export default setAuthToken;
