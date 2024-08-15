// Needed Resources (Imports)
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const regValidateClassification = require('../utilities/classification-validation')
const regValidateInventory = require('../utilities/inventory-validation')
const regValidateInventoryReview = require('../utilities/inventory-review-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

//Route for vehicle detail
router.get("/detail/:iventoryId", utilities.handleErrors(invController.buildByInventoryId));

router.post(
        "/add-review", 
        utilities.checkLogin, 
        regValidateInventoryReview.inventoryReviewRules(),
        regValidateInventoryReview.checkRegData,
        utilities.handleErrors(invController.addInventoryReview)
        );


router.get("/edit-review/:review_id", utilities.checkLogin, utilities.handleErrors(invController.editInventoryReviewView));

router.post("/edit-review", 
        utilities.checkLogin, 
        regValidateInventoryReview.inventoryReviewUpdateRules(),
        regValidateInventoryReview.checkRegUpdateData,
        utilities.handleErrors(invController.updateInventoryReview)
        );
        
router.get("/delete-review/:review_id", utilities.checkLogin, utilities.handleErrors(invController.deleteInventoryReviewView));


router.post("/delete-review/",
    utilities.checkLogin,
    utilities.handleErrors(invController.deleteInventoryReview)
);

//Route for Management page
router.get("/", utilities.restrictedAccess, utilities.handleErrors(invController.buildManagement));

//Route for Add Classification
router.get("/add-classification", utilities.restrictedAccess, utilities.handleErrors(invController.buildAddClassification));

// Process the Add Classification data
router.post(
    "/add-classification",
    utilities.restrictedAccess,
    regValidateClassification.classificationRules(),
    regValidateClassification.checkRegData,
    utilities.handleErrors(invController.AddClassification)
);

//Route for Add inventory
router.get("/add-inventory", utilities.restrictedAccess, utilities.handleErrors(invController.buildAddInventory));

// Process the Add inventory data
router.post(
    "/add-inventory",
    utilities.restrictedAccess,
    regValidateInventory.inventoryRules(),
    regValidateInventory.checkRegData,
    utilities.handleErrors(invController.AddInventory)
);

router.get("/getInventory/:classification_id", utilities.restrictedAccess, utilities.handleErrors(invController.getInventoryJSON))

router.get("/edit/:inv_id", utilities.restrictedAccess, utilities.handleErrors(invController.editInventoryView))

router.post("/update/",
    utilities.restrictedAccess,
    regValidateInventory.inventoryRules(),
    regValidateInventory.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
);


router.get("/delete/:inv_id", utilities.restrictedAccess, utilities.handleErrors(invController.deleteInventoryView))

router.post("/delete/",
utilities.restrictedAccess,
    utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;