const bcrypt = require("bcryptjs");
const accountModel = require("../models/account-model");
const utilities = require("../utilities");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function loginView(req, res, next) {
  let nav = await utilities.getNav();

  //req.flash("notice", "This is a flash message.")
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Logout
 * *************************************** */
async function lougoutRequest(req, res, next) {
  res.clearCookie("jwt");
  res.clearCookie("sessionId");

  res.redirect("/");
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function registerView(req, res, next) {
  let nav = await utilities.getNav();

  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Edit User View
 * *************************************** */
async function editUserView(req, res, next) {
  const user_id = parseInt(req.params.user_id)
  let nav = await utilities.getNav()
  const userData = await accountModel.getAccountById(user_id)

  res.render("account/update", {
    title: "Update Profile",
    nav,
    errors: null,
    account_firstname: userData?.account_firstname,
    account_lastname: userData?.account_lastname,
    account_email: userData?.account_email,
    account_password: userData?.account_password,
    account_id: userData?.account_id,
  });
}

function updateJWT(accountData, res){
  delete accountData.account_password;

  const accessToken = jwt.sign(
    accountData,
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: 3600 }
  );

  if (process.env.NODE_ENV === "development") {
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
  } else {
    res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000});
  }
}

/* ****************************************
 *  Edit User Request
 * *************************************** */
async function editUserRequest(req, res, next) {
  let nav = await utilities.getNav()
  const {
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  } = req.body

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  )

  if (updateResult) {
    
    updateJWT(updateResult, res)

    req.flash("notice", `Your information has been updated!`)
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the profile update failed.")
    res.status(501).render("account/update", {
    title: "Update Profile ",
    nav,
    errors: null,
    account_id,
    account_firstname,
    account_lastname,
    account_email,
    })
  }
}

/* ****************************************
 *  Edit User Password Request
 * *************************************** */
async function editUserPasswordRequest(req, res, next) {
  let nav = await utilities.getNav()

  const {
    account_id,
    account_password,
  } = req.body

    // Hash the password before storing
    let hashedPassword;
    try {
      // regular password and cost (salt is generated automatically)
      hashedPassword = await bcrypt.hashSync(account_password, 10);
    } catch (error) {
      req.flash(
        "notice",
        "Sorry, there was an error updating the password."
      );
      res.status(500).render("account/update", {
        title: "Update Profile",
        nav,
        errors: null,
        account_id,
      });
    }

  const updateResult = await accountModel.updateAccountPassword(account_id, hashedPassword)

  if (updateResult) {
    req.flash("notice", `Your password has been updated!`)
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    res.status(501).render("account/update", {
    title: "Update Profile",
    nav,
    errors: null,
    account_id
    })
  }
}




/* ****************************************
 *  Process login request
 * ************************************ */
async function loginRequest(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      // delete accountData.account_password;
      // const accessToken = jwt.sign(
      //   accountData,
      //   process.env.ACCESS_TOKEN_SECRET,
      //   { expiresIn: 3600 }
      // );
      // if (process.env.NODE_ENV === "development") {
      //   res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      // } else {
      //   res.cookie("jwt", accessToken, {
      //     httpOnly: true,
      //     secure: true,
      //     maxAge: 3600 * 1000,
      //   });
      // }

      updateJWT(accountData, res)

      return res.redirect("/account/");
    }
  } catch (error) {
    return new Error("Access Forbidden");
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerRequest(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/* ****************************************
 *  Deliver Account management view
 * *************************************** */
async function accountManagementView(req, res, next) {
  let nav = await utilities.getNav();
  const account_id = res.locals.accountData.account_id
  const accountReviewsData = await accountModel.getAccountReviewsById(account_id);
  const reviewsView = await utilities.buildReviewListByUserView(accountReviewsData)

  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    reviewsView
  });
}

module.exports = {
  loginView,
  loginRequest,
  lougoutRequest,
  registerView,
  registerRequest,
  accountManagementView,
  editUserView,
  editUserRequest,
  editUserPasswordRequest
};
