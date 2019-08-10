import isEmpty from "../validation/is-empty";
import {
  SET_CURRENT_USER,
  SET_CURRENT_USER_RESET_PASS_DATA,
  GET_CHANGED_PASSWORD_LOADING_START,
  GET_CHANGED_PASSWORD_LOADING_STOP,
  GET_FORGOT_PASSWORD_LOADING_START,
  GET_FORGOT_PASSWORD_LOADING_STOP
} from "../actions/types";

const initialState = {
  isAuthenticated: false,
  user: {},
  resetpassworddata: {},
  changedpassloading: false,
  forgotpassloading: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_USER: //IF THE ACTION dispatch SET_CURRENT_USER type
      return {
        //here we cannot change or mutate the state we just make copy of the state
        ...state, //here we return current state
        isAuthenticated: !isEmpty(action.payload), //here we check the that the payload is send by setCurrentUser from the authActions.js  if its not empty its mean the payload is filled or it has user data then user should be authenticated
        user: action.payload //here we set the user object with fill payload
      };
    case SET_CURRENT_USER_RESET_PASS_DATA: //IF THE ACTION dispatch SET_CURRENT_USER type
      return {
        //here we cannot change or mutate the state we just make copy of the state
        ...state, //here we return current state
        resetpassworddata: action.payload //here we set the user object with fill payload
      };
    case GET_CHANGED_PASSWORD_LOADING_START:
      return {
        ...state,
        changedpassloading: true
      };
    case GET_CHANGED_PASSWORD_LOADING_STOP:
      return {
        ...state,
        changedpassloading: false
      };
    case GET_FORGOT_PASSWORD_LOADING_START:
      return {
        ...state,
        forgotpassloading: true
      };
    case GET_FORGOT_PASSWORD_LOADING_STOP:
      return {
        ...state,
        forgotpassloading: false
      };

    default:
      return state;
  }
}
