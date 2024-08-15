const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}
const accountModel = require("../models/account-model")

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = '<ul class="nav-main">'
  list += '<li><a class="nav-url" href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a class="nav-url" href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img class="car-type-img" src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h3>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h3>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }


  

/* **************************************
* Build the detail view HTML
* ************************************ */
Util.buildDetailView = async function(vehicle){
  let detail = ''

  if(vehicle){
      detail = `
        <div class="car-detail">
          <div class="picture">
            <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors"/>
          </div>
          <div class="description">
            <table>
              <tr>
                <th>${vehicle.inv_make} ${vehicle.inv_model} Details</th>
              </tr>
              <tr>
                <td>
                  <strong>Price: $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</strong>
                </td>
              </tr>
              <tr>
                <td><strong>Description:</strong> ${vehicle.inv_description}</td>
              </tr>
              <tr>
                <td><strong>Color:</strong> ${vehicle.inv_color}</td>
              </tr>
              <tr>
                <td><strong>Miles:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}</td>
              </tr>
            </table>
          </div>
        </div>
      `
  } else { 
    detail += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return detail
}


/* **************************************
* Build the review list view HTML
* ************************************ */
Util.buildReviewListView = async function(data){
  let grid = '<h2>Customer Reviews</h2>'

  if(data && data.length > 0){

    grid += '<ul>'
    data.forEach(r => { 
      grid += `<li>
                <strong>${r.screen_name}</strong>
                wrote on ${new Intl.DateTimeFormat('en-US', {month: 'long', day: 'numeric', year: 'numeric'}).format(r.review_date)}
                <hr/>
                <p>${r.review_text}</p>
              </li>`;
    })
    grid += '</ul>'
  } else { 
    grid += '<p style="background-color:lightgoldenrodyellow">Be the first to write a review.</p>'
  }
  return grid
}

/* **************************************
* Build the review list by the account view HTML
* ************************************ */
Util.buildReviewListByUserView = async function(data){
  let grid = ''
  if(data.length > 0){
    grid = '<h3>My Reviews</h3>'
    grid += '<ol>'
    data.forEach(r => { 
      grid += `<li>
                Reviewed the ${r.inv_year} ${r.inv_make} ${r.inv_model} on ${new Intl.DateTimeFormat('en-US', {month: 'long', day: 'numeric', year: 'numeric'}).format(r.review_date)}
                | <a href="/inv/edit-review/${r.review_id}">Edit</a>
                | <a href="/inv/delete-review/${r.review_id}">Delete</a>

              </li>`;
    })
    grid += '</ol><br><br>'
  }

  return grid
}

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" class="classification-list" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}
  /* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }     
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }


 //Util.updateJWTToken 

 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


 /* ****************************************
 *  RestrictedAccess (Only Admin and Employees)
 * ************************************ */
 Util.restrictedAccess = (req, res, next) => {
  account_type = res.locals?.accountData?.account_type;

  if (res.locals.loggedin && (account_type == "Employee" || account_type == "Admin")) {
    next()
  } else {
    req.flash("notice", "Only Employee and Admin can access this functionality.")
    return res.redirect("/account/login")
  }
 }

module.exports = Util