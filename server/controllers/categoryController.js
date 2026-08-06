const Category = require("../models/Category");


// GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      success: true,
      categories,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {

    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      category,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  getCategories,
  createCategory,
};