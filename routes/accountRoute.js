const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accountController.loginView));
router.post("/login", regValidate.loginRules(), regValidate.checkLogInData, utilities.handleErrors(accountController.loginRequest));
router.get("/logout", utilities.checkLogin, utilities.handleErrors(accountController.lougoutRequest));

router.get("/register", utilities.handleErrors(accountController.registerView));
router.post("/register", regValidate.registationRules(), regValidate.checkRegData, utilities.handleErrors(accountController.registerRequest))

router.get("/edit/:user_id", utilities.checkLogin, utilities.handleErrors(accountController.editUserView));
router.post("/edit/",
    utilities.checkLogin,
    regValidate.updateUserRules(),
    regValidate.checkUpdateAccountData,
    utilities.handleErrors(accountController.editUserRequest)
);
router.post("/edit-password/",
    utilities.checkLogin,
    regValidate.updateUserPasswordRules(),
    regValidate.checkUpdateAccountData,
    utilities.handleErrors(accountController.editUserPasswordRequest)
);

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.accountManagementView));

module.exports = router;