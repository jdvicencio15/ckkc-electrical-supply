const { body } = require("express-validator");


const itemValidator = [
  body("name")
    .notEmpty()
    .withMessage("Item name is required"),

  body("description")
    .notEmpty()
    .withMessage("Description is required"),

  body("category")
    .notEmpty()
    .withMessage("Category is required"),
];


module.exports = {
  itemValidator,
};