import AppError from "../utils/AppError.js";

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((item) => ({
        field: item.path.join("."),
        message: item.message,
      }));

      const validationError = new AppError("Validation failed.", 400);

      validationError.details = details;

      return next(validationError);
    }

    req[property] = value;

    next();
  };
};

export default validate;
