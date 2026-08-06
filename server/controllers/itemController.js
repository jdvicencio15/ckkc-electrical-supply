const Item = require("../models/Item");


// GET ALL ITEMS
const getItems = async (req, res, next) => {
  try {
    const items = await Item.find().populate("category", "name");

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });

  } catch(error){
 next(error);
}
};

// GET SINGLE ITEM
const getItemById = async (req, res, next) => {
  try {

    const item = await Item.findById(req.params.id)
      .populate("category", "name");


    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }


    res.status(200).json({
      success: true,
      item,
    });


  } catch(error){
 next(error);
}
};


// CREATE ITEM
const createItem = async (req, res, next) => {
  try {

    const item = await Item.create(req.body);

    res.status(201).json({
      success: true,
      item,
    });

  } catch(error){
 next(error);
}
};



// UPDATE ITEM
const updateItem = async (req, res, next) => {
  try {

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );


    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }


    res.status(200).json({
      success: true,
      item,
    });


  } catch(error){
 next(error);
}
};


// DELETE ITEM
const deleteItem = async (req, res, next) => {
  try {

    const item = await Item.findByIdAndDelete(
      req.params.id
    );


    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Item deleted",
    });


  } catch(error){
 next(error);
}
};


module.exports = {
    getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};