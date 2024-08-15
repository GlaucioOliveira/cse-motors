-- 1. Insert the following new record to the account table
insert into account (account_firstname, account_lastname, account_email, account_password) 
	values ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- list recent added record;
select * from account;

-- 2. Modify the Tony Stark record to change the account_type to "Admin".
update account set account_type = 'Admin' where account_email = 'tony@starkent.com';

-- 3. Delete the Tony Stark record from the database.
delete from account where account_email = 'tony@starkent.com';

select * from inventory where inv_make = 'GM' and inv_model = 'Hummer';

-- 4. Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors" using a single query
update inventory set inv_description = replace(inv_description, 'small interiors', 'a huge interior');

-- 5. Use an inner join to select the make and model fields from the inventory table and the classification name field from the classification table for inventory items that belong to the "Sport" category
select inv.inv_make, inv.inv_model, c.classification_name from inventory inv
inner join classification c on c.classification_id = inv.classification_id
where c.classification_name = 'Sport';


-- 6. Update all records in the inventory table to add "/vehicles" to the middle of the file path in the inv_image and inv_thumbnail columns using a single query
select * from inventory;

update inventory set 
	inv_image = replace(inv_image, '/images/', '/images/vehicles/')
	inv_thumbnail = replace(inv_image, '/images/', '/images/vehicles/');