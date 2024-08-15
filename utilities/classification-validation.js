const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel = require("../models/inventory-model")


  /****************************************
  *  Classification Data Validation Rules
  *****************************************/
  validate.classificationRules = () => {
    return [
      // classification name is required and must be string and alphanumeric.
      body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isAlphanumeric()
        .isLength({ min: 1 })
        .withMessage("Please provide a valid classification name.")
        .custom(async (classification_name) => {
          const emailExists = await invModel.checkExistingClassification(classification_name)
          if (emailExists){
            throw new Error("Classification exists. Please use a different classification name")
          }
        }),
    ]
  }


/* ******************************
 * Check data and return errors or continue to classification creation
 * ******************************/
validate.checkRegData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        errors,
        title: "Add New Classification",
        nav,
        classification_name
      })
      return
    }
    next()
  }
  
  module.exports = validate