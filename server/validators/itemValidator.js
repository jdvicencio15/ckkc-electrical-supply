const { body } = require("express-validator");

const itemValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Item name is required"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  body("category")
    .isMongoId()
    .withMessage("Valid category is required"),
];

module.exports = {
  itemValidator,
};