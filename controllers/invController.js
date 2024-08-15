const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0]?.classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}

/* ***************************
 *  Build inventory by detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.iventoryId
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
    errors: null,
    inv_id
  })
}

/* ***************************
 *  Build Management
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()

  const title = "Vehicle Management"

  res.render("./inventory/management", {
    title: title,
    nav,
    errors: null,
    classificationList
  })
}

/* ***************************************************
 *  Build Management - Add Classification View
 * ***************************************************/
invCont.buildAddClassification = async function (req, res, next) {
  const detail = ""
  let nav = await utilities.getNav()

  const title = "Add New Classification"

  res.render("./inventory/add-classification", {
    title: title,
    nav,
    detail,
    errors: null,
  })
}

/* ****************************************
*  Add Classification - Process
* *************************************** */
invCont.AddClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const regResult = await invModel.registerClassification(classification_name)
  let nav = await utilities.getNav()

  if (regResult) {
    req.flash(
      "notice",
      `The ${classification_name} classification was successfully added.`
    )
    const classificationList = await utilities.buildClassificationList()

    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classificationList
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  }
}

/* ***************************************************
 *  Build Management - Add Inventory View
 * ***************************************************/
invCont.buildAddInventory = async function (req, res, next) {
  const classificationList = await utilities.buildClassificationList();
  let nav = await utilities.getNav()

  const title = "Add New Inventory"

  res.render("inventory/add-inventory", {
    title: title,
    nav,
    classificationList,
    errors: null,
  })
}


/* ***************************
 *  Build add inventory Review
 * ************************** */
invCont.addInventoryReview = async function (req, res, next) {
  const { review_text, inv_id, screen_name} = req.body
  const account_id = res.locals.accountData.account_id
  const regResult = await invModel.addInventoryReview(review_text, inv_id, account_id, screen_name)

  if (regResult) {

    res.redirect(`/inv/detail/${inv_id}`)

  } else {
    const data = await invModel.getInventoryById(inv_id)
    const detail = await utilities.buildDetailView(data)
  
    const dataReview = await invModel.getInventoryReviewsByInvId(inventory_id)
    const reviewList = await utilities.buildReviewListView(dataReview)
    let nav = await utilities.getNav()
  
    const title = data.inv_year + " " + data.inv_make + " " + data.inv_model
  
    req.flash("notice", "Sorry, the registration of the review failed.")
    res.status(501).render("./inventory/detail", {
      title: title,
      nav,
      detail,
      reviewList,
      errors: null,
      review_text,
      inv_id,
      screen_name
    })
  }
}


/* ***************************
 *  Build edit Review View
 * ************************** */
invCont.editInventoryReviewView = async function (req, res, next) {
    const review_id = parseInt(req.params.review_id)
    const account_id = res.locals.accountData.account_id
    const dataReview = await invModel.getReviewById(review_id, account_id)

    let nav = await utilities.getNav()
  
    const title = `Edit ${dataReview.inv_year} ${dataReview.inv_make} ${dataReview.inv_model} Review`
  
    res.render("./review/edit-review", {
      title: title,
      nav,
      errors: null,
      review_id: review_id,
      review_text: dataReview?.review_text,
      review_date: new Intl.DateTimeFormat('en-US', {month: 'long', day: 'numeric', year: 'numeric'}).format(dataReview?.review_date) 
    })
  }

/* ***************************
 *  Build Review update 
 * ************************** */
invCont.updateInventoryReview = async function (req, res, next) {
    const { review_id, review_text } = req.body
    const account_id = res.locals.accountData.account_id
    const dataUpdate = await invModel.updateReviewById(review_text, review_id, account_id)
  
    if (dataUpdate) {
      req.flash("notice", `The review was successfully updated.`)
      res.redirect("/account/")
    } else {
      let nav = await utilities.getNav()
      const dataReview = await invModel.getReviewById(review_id)

      const title = `Edit ${dataReview?.inv_year} ${dataReview?.inv_make} ${dataReview?.inv_model} Review`

      req.flash("notice", "Sorry, the update failed.")
      res.status(501).render("./review/edit-review", {
        title: title,
        nav,
        errors: null,
        review_id: review_id,
        review_text: dataReview?.review_text,
        review_date: new Intl.DateTimeFormat('en-US', {month: 'long', day: 'numeric', year: 'numeric'}).format(dataReview?.review_date) 
      })
    }


  }
  

/* ***************************
 *  Build Confirm Delete Review View
 * ************************** */
invCont.deleteInventoryReviewView = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id)
  const account_id = res.locals.accountData.account_id
  const dataReview = await invModel.getReviewById(review_id, account_id)

  let nav = await utilities.getNav()

  const title = `Delete ${dataReview?.inv_year} ${dataReview?.inv_make} ${dataReview?.inv_model} Review`

  res.render("./review/delete-confirm", {
    title: title,
    nav,
    errors: null,
    review_id: review_id,
    review_text: dataReview?.review_text,
    review_date: new Intl.DateTimeFormat('en-US', {month: 'long', day: 'numeric', year: 'numeric'}).format(dataReview?.review_date) 
  })
}


/* ***************************
 *  Delete Inventory Review Data
 * ************************** */
invCont.deleteInventoryReview = async function (req, res, next) {
  let nav = await utilities.getNav()

  const {review_id} = req.body
  const account_id = res.locals.accountData.account_id
  const deleteResult = await invModel.deleteInventoryReview(review_id, account_id)

  if (deleteResult) {
    req.flash("notice", `The review deletion was successfully done.`)
    res.redirect("/account/")
  } else {
    const dataReview = await invModel.getReviewById(review_id, account_id)
    let nav = await utilities.getNav()
  
    const title = `Delete ${dataReview?.inv_year} ${dataReview?.inv_make} ${dataReview?.inv_model} Review`
    req.flash("notice", "Sorry, the deletion failed.")
    res.status(501).render("./review/delete-confirm", {
      title: title,
      nav,
      errors: null,
      review_id: review_id,
      review_text: dataReview?.review_text,
      review_date: new Intl.DateTimeFormat('en-US', {month: 'long', day: 'numeric', year: 'numeric'}).format(dataReview?.review_date) 
    })
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}


/* ***************************
 *  Build delete inventory view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
    })
}

/* ****************************************
*  Add Inventory - Process
* *************************************** */
invCont.AddInventory = async function (req, res, next) {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  const regResult = await invModel.registerInventory(classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color)
 
  let nav = await utilities.getNav()

  if (regResult) {
    const classificationList = await utilities.buildClassificationList()

    req.flash(
      "notice",
      `The ${inv_make} ${inv_model} was successfully added.`
    )
    
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      errors: null,
      classificationList
    })
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)

    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList: classificationList,
      errors: null,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationList,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}


/* ***************************
 *  Delete Inventory Data
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()

  const {
    inv_id,
    inv_make,
    inv_model,
    inv_price,
    inv_year
  } = req.body

  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", `The deletion was successfully.`)
    res.redirect("/inv/")
  } else {
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the deletion failed.")
    res.status(501).render("inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    })
  }
}


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


module.exports = invCont