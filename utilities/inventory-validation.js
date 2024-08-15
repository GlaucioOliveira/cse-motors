const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel = require("../models/inventory-model")


  /****************************************
  *  Inventory Data Validation Rules
  *****************************************/
  validate.inventoryRules = () => {
    return [
      // classification Id is required and must be a valid option.
      body("classification_id")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please select a classification.")
        .custom(async (classification_id) => {
          const classifcationExists = await invModel.checkExistingClassificationById(classification_id)
          if (!classifcationExists){
            throw new Error("Please use a valid classification.")
          }
        }),

        body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Please type a valid Make."),

        body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Please type a valid Make."),

        body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 10 })
        .withMessage("Please type a valid description."),

        body("inv_image")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please type a valid image path."),

        body("inv_thumbnail")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please type a valid thumbnail path."),

        body("inv_price")
        .trim()
        .escape()
        .isFloat({ min: 0 }).withMessage('Price must be a positive number')
        .withMessage("Please type a valid price."),

        body("inv_year")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 4, max: 4 })
        .isInt({ min: 1000, max: 9999 })
        .withMessage("Please type a valid year."),

        body("inv_miles")
        .trim()
        .escape()
        .isInt({ min: 100, max: 999999 })
        .withMessage("Please type a valid mile."),

        body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Please type a valid color."),
    ]
  }


/* ******************************
 * Check data and return errors or continue to classification creation
 * ******************************/
validate.checkRegData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList(classification_id)
      
      res.render("inventory/add-inventory", {
        errors,
        title: "Add New Inventory",
        nav,
        classificationList,
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      })
      return
    }
    next()
  }
  


/* ******************************
 * Check data and return errors or continue to classification edition
 * ******************************/
validate.checkUpdateData = async (req, res, next) => {
  const { inv_id, classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)

    res.render("inventory/edit-inventory", {
      errors,
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      inv_id,
      classification_id,
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
    return
  }
  next()
}  
  module.exports = validate