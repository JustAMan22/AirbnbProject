const { validationResult } = require("express-validator");

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    let errors = {};
    validationErrors.array().map((error) => {
      errors[error.path] = `${error.msg}`;
    });
    const err = Error("Bad Request");
    err.errors = errors;
    err.status = 400;
    err.title = "Bad Request";

    next(err);
  }

  next();
};

module.exports = {
  handleValidationErrors,
};
