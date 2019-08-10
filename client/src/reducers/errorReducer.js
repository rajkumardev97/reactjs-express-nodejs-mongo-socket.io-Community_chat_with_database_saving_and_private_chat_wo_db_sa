import { GET_ERRORS } from "../actions/types";

const initialState = {};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_ERRORS:
      return action.payload; //here err object return with updated errors value if its received any kind of error from authActions.js and return to the root reducer like reducer folder => index.js and set the errors object
    default:
      return state;
  }
}
