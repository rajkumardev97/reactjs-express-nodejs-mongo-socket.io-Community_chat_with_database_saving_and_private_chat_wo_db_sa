const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateChangedPassInput(data) {
  let errors = {}; //here we set the empty errors object

  data.currentpassword = !isEmpty(data.currentpassword)
    ? data.currentpassword
    : "";
  data.newpassword = !isEmpty(data.newpassword) ? data.newpassword : "";
  data.newpassword2 = !isEmpty(data.newpassword2) ? data.newpassword2 : "";

  if (Validator.isEmpty(data.currentpassword)) {
    errors.currentpassword = "Current Password field is required";
  }

  if (Validator.isEmpty(data.newpassword)) {
    errors.newpassword = "New Password field is required";
  }

  if (!Validator.isLength(data.newpassword, { min: 6, max: 30 })) {
    errors.newpassword = "New Password must be at least 6 characters";
  }

  if (Validator.isEmpty(data.newpassword2)) {
    errors.newpassword2 = "Confirm New Password field is required";
  }

  if (!Validator.equals(data.newpassword, data.newpassword2)) {
    errors.newpassword2 = "Confirm New Passwords must match";
  }

  if (Validator.equals(data.currentpassword, data.newpassword)) {
    errors.newpassword =
      "New passwords should be different then current password!!";
  }

  return {
    errors,
    isValid: isEmpty(errors) //if errors object is empty as we initialize above to at the end of all validation its mean all validation correct in case any validation fail so errors object get fill by its actual validation errors and the errors object not empty anymore then its set the value of isValid and return to the register api with value of isValid.
  };
};
