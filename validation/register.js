const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {}; //here we set the empty errors object

  data.firstname = !isEmpty(data.firstname) ? data.firstname : "";
  data.lastname = !isEmpty(data.lastname) ? data.lastname : "";
  data.nickname = !isEmpty(data.nickname) ? data.nickname : "";
  data.gender = !isEmpty(data.gender) ? data.gender : "";
  data.ilike = !isEmpty(data.ilike) ? data.ilike : "";
  data.nearcity = !isEmpty(data.nearcity) ? data.nearcity : "";
  data.maxdistance = !isEmpty(data.maxdistance) ? data.maxdistance : "";
  data.maxdistance = !isEmpty(data.maxdistance) ? data.maxdistance : "";
  data.location = !isEmpty(data.location) ? data.location : "";
  data.phone = !isEmpty(data.phone) ? data.phone : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.confirmpass = !isEmpty(data.confirmpass) ? data.confirmpass : "";

  if (!Validator.isLength(data.firstname, { min: 2, max: 30 })) {
    errors.firstname = "Name must be between 2 and 30 characters";
  }

  if (!Validator.isLength(data.phone, { min: 10, max: 10 })) {
    errors.phone = "phone number must be 10";
  }

  if (Validator.isEmpty(data.lastname)) {
    errors.lastname = "lastname field is required";
  }

  if (Validator.isEmpty(data.nickname)) {
    errors.nickname = "nickname field is required";
  }

  if (Validator.isEmpty(data.gender)) {
    errors.gender = "gender field is required";
  }
  if (Validator.isEmpty(data.ilike)) {
    errors.ilike = "ilike field is required";
  }

  if (Validator.isEmpty(data.nearcity)) {
    errors.nearcity = "nearcity field is required";
  }

  if (Validator.isEmpty(data.maxdistance)) {
    errors.maxdistance = "maxdistance field is required";
  }

  if (Validator.isEmpty(data.location)) {
    errors.location = "location field is required";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.phone)) {
    errors.phone = "phone field is required";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be at least 6 characters";
  }

  if (Validator.isEmpty(data.confirmpass)) {
    errors.confirmpass = "Confirm Password field is required";
  }

  if (!Validator.equals(data.password, data.confirmpass)) {
    errors.confirmpass = "Passwords must match";
  }

  return {
    errors,
    isValid: isEmpty(errors) //if errors object is empty as we initialize above to at the end of all validation its mean all validation correct in case any validation fail so errors object get fill by its actual validation errors and the errors object not empty anymore then its set the value of isValid and return to the register api with value of isValid.
  };
};
