const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
        [classification_id]
      )
      return data.rows
    } catch (error) {
      console.error("getInventoryByClassificationId error " + error)
    }
  }

/* ***************************
 *  Get all inventory review by inventory_id
 * ************************** */
async function getInventoryReviewsByInvId(inventory_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.review AS r
        JOIN public.account AS a
        ON r.account_id = a.account_id
        WHERE r.inv_id = $1
        order by r.review_date desc`,
        [inventory_id]
      )
      return data.rows
    } catch (error) {
      console.error("getInventoryReviewsByInvId error " + error)
    }
  }

/* ***************************
 *  Get review by id
 * ************************** */
async function getReviewById(review_id, account_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.review AS r
        JOIN public.inventory AS i
        ON r.inv_id = i.inv_id
        WHERE r.review_id = $1 and r.account_id = $2`,
        [review_id, account_id]
      )
      return data?.rows[0]
    } catch (error) {
      console.error("getReviewById error " + error)
    }
  }


/* ***************************
 *  Update review by id
 * ************************** */
async function updateReviewById(review_text, review_id, account_id) {
    try {
      const data = await pool.query(
        `UPDATE public.review SET review_text = $1
        WHERE review_id = $2 and account_id = $3 RETURNING *`,
        [review_text, review_id, account_id]
      )
      return data?.rows[0]
    } catch (error) {
      console.error("updateReviewById error " + error)
    }
  }


/* ***************************
 *  Get iventory by iventory_id
 * ************************** */
async function getInventoryById(inventory_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id
        WHERE i.inv_id = $1`,
        [inventory_id]
      )
      return data?.rows[0]
    } catch (error) {
      console.error("getInventoryById error " + error)
    }
  }


/* *****************************
*   Register new Classification
* *************************** */
async function registerClassification(classification_name){
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}


/* *****************************
*   Register new Inventory
* *************************** */
async function registerInventory(classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color){
  try {
    const sql = "INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    return await pool.query(sql, [classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color])
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Register Inventory Review
* *************************** */
async function addInventoryReview(review_text, inv_id, account_id, screen_name){
  try {
    const sql = "INSERT INTO public.review (review_text, inv_id, account_id, screen_name) VALUES ($1, $2, $3, $4) RETURNING *"
    return await pool.query(sql, [review_text, inv_id, account_id, screen_name])
  } catch (error) {
    return error.message
  }
}


/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

/* ***************************
 *  Delete Inventory Review Item
 * ************************** */
async function deleteInventoryReview(review_id, account_id) {
  try {
    const sql = 'DELETE FROM review WHERE review_id = $1 and account_id = $2'
    const data = await pool.query(sql, [review_id, account_id])
  return data
  } catch (error) {
    new Error("Delete Review Error")
  }
}



/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}


/* **********************
 *   Check for existing Classification
 * ********************* */
async function checkExistingClassification(classification_name){
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const email = await pool.query(sql, [classification_name])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* **********************
 *   Check for existing Classification by Id
 * ********************* */
async function checkExistingClassificationById(classification_id){
  try {
    const sql = "SELECT * FROM classification WHERE classification_id = $1"
    const email = await pool.query(sql, [classification_id])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

module.exports = {
  getClassifications, 
  getInventoryByClassificationId, 
  getInventoryById, 
  registerClassification, 
  checkExistingClassification, 
  checkExistingClassificationById,
  registerInventory,
  updateInventory,
  deleteInventoryItem,
  getInventoryReviewsByInvId,
  addInventoryReview,
  getReviewById,
  updateReviewById,
  deleteInventoryReview
}