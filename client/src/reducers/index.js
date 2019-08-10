import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";

export default combineReducers({
  auth: authReducer, //the auth object is display in redux chrome extention from taking the object state from authReducer
  errors: errorReducer
});
