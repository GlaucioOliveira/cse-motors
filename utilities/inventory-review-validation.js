const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel = require("../models/inventory-model")


  /****************************************
  *  Inventory Review Validation Rules
  *****************************************/
  validate.inventoryReviewRules = () => {
    return [
        body("review_text")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 10 })
        .withMessage("Please type a valid review (min 10 characters)."),

        body("screen_name")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Please type a valid screen name."),
    ]
  }

  /****************************************
  *  Inventory Review Update Rules
  *****************************************/
  validate.inventoryReviewUpdateRules = () => {
    return [
        body("review_text")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 10 })
        .withMessage("Please type a valid review (min 10 characters)."),
    ]
  }


/* ******************************
 * Check data and return errors or continue to classification creation
 * ******************************/
validate.checkRegData = async (req, res, next) => {
    const { review_text, screen_name, inv_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      const data = await invModel.getInventoryById(inv_id)
      const detail = await utilities.buildDetailView(data)
    
      const dataReview = await invModel.getInventoryReviewsByInvId(inv_id)
      const reviewList = await utilities.buildReviewListView(dataReview)
      let nav = await utilities.getNav()
    
      const title = data.inv_year + " " + data.inv_make + " " + data.inv_model
    
      res.render("./inventory/detail", {
        title: title,
        nav,
        detail,
        reviewList,
        errors,
        review_text,
        inv_id,
        screen_name
      })

      return
    }
    next()
  }
  

/* ******************************
 * Check update data and return errors or continue to update
 * ******************************/
validate.checkRegUpdateData = async (req, res, next) => {
    const { review_text, review_id } = req.body
    let errors = []
    errors = validationResult(req)

    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      const dataReview = await invModel.getReviewById(review_id)

      const title = `Edit ${dataReview?.inv_year} ${dataReview?.inv_make} ${dataReview?.inv_model} Review`

      res.render("./review/edit-review", {
        title: title,
        nav,
        errors,
        review_id: review_id,
        review_text: review_text,
        review_date: new Intl.DateTimeFormat('en-US', {month: 'long', day: 'numeric', year: 'numeric'}).format(dataReview?.review_date) 
      })

      return
    }
    next()
  }
  
  module.exports = validate