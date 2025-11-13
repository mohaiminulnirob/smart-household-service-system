// utils/responseHelper.js

// Successful response
export const responseSuccess = (res, message = "Success", status = 200) => {
  res.status(status).json({
    status: "success",
    message,
  });
};

// Error response
export const responseError = (res, message = "Something went wrong", status = 500, errors = null) => {
  res.status(status).json({
    status: "error",
    message,
    errors,
  });
};

// Validation error
export const responseValidationError = (res, errors, message = "Validation failed") => {
  res.status(400).json({
    status: "fail",
    message,
    errors,
  });
};
