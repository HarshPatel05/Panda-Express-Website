-- HOW TO INSERT!

-- Make sure that the file path uses /
--  \i 'C:/Users/...'

-- FOR COBY: \i 'C:/Users/cobyr/OneDrive/Documents/TAMU/JuniorYearFiles/Fall 24/CSCE-331-904/CodePandaProject3/project-3-43-codepandas/PSQL_Table_Controls/populateMenuItems.sql'
-- psql -h csce-315-db.engr.tamu.edu -p 5432 -U csce331_43 -d csce331_43

ALTER TABLE inventory
ADD CONSTRAINT unique_menuItemId UNIQUE (menuItemId);

-- This will insert the inventory item into the table
-- It WILL overwrite any inventory item with the same name
INSERT INTO menuItems (menuItemId, menuItem, price, size, displayName)
VALUES

-- ENTREES

-- blackPepperSteak
(1,'blackPepperSteak', 6.7, 'sm', 'Black Pepper<br>Steak'),
(2,'blackPepperSteak', 11.5, 'md', 'Black Pepper<br>Steak'),
(3,'blackPepperSteak', 15.7, 'lg', 'Black Pepper<br>Steak'),

-- honeyWalnutShrimp
(4,'honeyWalnutShrimp', 6.7, 'sm', 'Honey Walnut<br>Shrimp'),
(5,'honeyWalnutShrimp', 11.5, 'md', 'Honey Walnut<br>Shrimp'),
(6,'honeyWalnutShrimp', 15.7, 'lg', 'Honey Walnut<br>Shrimp'),

-- kungPaoChicken
(7,'kungPaoChicken', 5.2, 'sm', 'Kung Pao<br>Chicken'),
(8,'kungPaoChicken', 8.5, 'md', 'Kung Pao<br>Chicken'),
(9,'kungPaoChicken', 11.2, 'lg', 'Kung Pao<br>Chicken'),

-- bourbonChicken
(10,'bourbonChicken', 5.2, 'sm', 'Bourbon<br>Chicken'),
(11,'bourbonChicken', 8.5, 'md', 'Bourbon<br>Chicken'),
(12,'bourbonChicken', 11.2, 'lg', 'Bourbon<br>Chicken'),

-- broccoliBeef
(13,'broccoliBeef', 5.2, 'sm', 'Broccoli<br>Beef'),
(14,'broccoliBeef', 8.5, 'md', 'Broccoli<br>Beef'),
(15,'broccoliBeef', 11.2, 'lg', 'Broccoli<br>Beef'),

-- honeySesameChicken
(16,'honeySesameChicken', 5.2, 'sm', 'Honey Sesame<br>Chicken'),
(17,'honeySesameChicken', 8.5, 'md', 'Honey Sesame<br>Chicken'),
(18,'honeySesameChicken', 11.2, 'lg', 'Honey Sesame<br>Chicken'),

-- orangeChicken
(19,'orangeChicken', 5.2, 'sm', 'Orange<br>Chicken'),
(20,'orangeChicken', 8.5, 'md', 'Orange<br>Chicken'),
(21,'orangeChicken', 11.2, 'lg', 'Orange<br>Chicken'),

-- beijingBeef
(22,'beijingBeef', 5.2, 'sm', 'Beijing<br>Beef'),
(23,'beijingBeef', 8.5, 'md', 'Beijing<br>Beef'),
(24,'beijingBeef', 11.2, 'lg', 'Beijing<br>Beef'),

-- stringBeanChicken
(25,'stringBeanChicken', 5.2, 'sm', 'String Bean<br>Chicken'),
(26,'stringBeanChicken', 8.5, 'md', 'String Bean<br>Chicken'),
(27,'stringBeanChicken', 11.2, 'lg', 'String Bean<br>Chicken'),

-- mushroomChicken
(28,'mushroomChicken', 5.2, 'sm', 'Mushroom<br>Chicken'),
(29,'mushroomChicken', 8.5, 'md', 'Mushroom<br>Chicken'),
(30,'mushroomChicken', 11.2, 'lg', 'Mushroom<br>Chicken'),

-- sweetFireChicken
(31,'sweetFireChicken', 5.2, 'sm', 'Sweet Fire<br>Chicken'),
(32,'sweetFireChicken', 8.5, 'md', 'Sweet Fire<br>Chicken'),
(33,'sweetFireChicken', 11.2, 'lg', 'Sweet Fire<br>Chicken'),

-- blackPepperChicken
(34,'blackPepperChicken', 5.2, 'sm', 'Black Pepper<br>Chicken'),
(35,'blackPepperChicken', 8.5, 'md', 'Black Pepper<br>Chicken'),
(36,'blackPepperChicken', 11.2, 'lg', 'Black Pepper<br>Chicken'),

-- grilledTeriyakiChicken
(37,'grilledTeriyakiChicken', 5.2, 'sm', 'Teriyaki<br>Chicken'),
(38,'grilledTeriyakiChicken', 8.5, 'md', 'Teriyaki<br>Chicken'),
(39,'grilledTeriyakiChicken', 11.2, 'lg', 'Teriyaki<br>Chicken'),


-- SIDES

-- Super Greens
(40,'superGreens', 0, 'sm', 'Super Greens'),
(41,'superGreens', 4.4, 'md', 'Super Greens'),
(42,'superGreens', 5.4, 'lg', 'Super Greens'),

-- Chow Mein
(43,'chowMein', 0, 'sm', 'Chow Mein'),
(44,'chowMein', 4.4, 'md', 'Chow Mein'),
(45,'chowMein', 5.4, 'lg', 'Chow Mein'),

-- White Rice
(46,'whiteRice', 0, 'sm', 'White Rice'),
(47,'whiteRice', 4.4, 'md', 'White Rice'),
(48,'whiteRice', 5.4, 'lg', 'White Rice'),

-- Fried Rice
(49,'friedRice', 0, 'sm', 'Fried Rice'),
(50,'friedRice', 4.4, 'md', 'Fried Rice'),
(51,'friedRice', 5.4, 'lg', 'Fried Rice'),


-- Appetizers

-- Veggie Spring Rolls
(52,'veggieSpringRolls', 2.0, 'sm', 'Veggie Spring Roll:'),
(53,'veggieSpringRolls', 11.20, 'lg', 'Veggie Spring Roll:'),

-- Cream Cheese Rangoons
(54,'creamCheeseRangoons', 2.0, 'sm', 'Cream Cheese Rangoon:'),
(55,'creamCheeseRangoons', 8.0, 'lg', 'Cream Cheese Rangoon:'),

-- Chicken Egg Roll
(56,'chickenEggRoll', 2.0, 'sm', 'Chicken Egg Roll:'),
(57,'chickenEggRoll', 11.20, 'lg', 'Chicken Egg Roll:'),

-- Apple Pie Roll
(58,'applePieRoll', 2.0, 'sm', 'Apple Pie Roll:'),
(59,'applePieRoll', 6.20, 'md', 'Apple Pie Roll:'),
(60,'applePieRoll', 8.0, 'lg', 'Apple Pie Roll:'),


-- Drinks

-- Fountain Drinks
(61,'fountainDrink', 2.10, 'sm', 'Fountain Drink (Sm):'),
(62,'fountainDrink', 2.30, 'md', 'Fountain Drink (Med):'),
(63,'fountainDrink', 2.50, 'lg', 'Fountain Drink (Lg):'),

-- waters
(64,'water', 2.30, 'sm', 'Aquafina:'),
(65,'water', 2.70, 'md', 'Aquafina:'),
(66,'water', 3.00, 'lg', 'Aquafina:'),

-- Juice
(67,'juice', 2.30, 'n/a', 'Juice:'),

-- Extra Drinks
(68,'gatorade', 2.70, 'n/a', 'Gatorade:'), 

--containers

(69, 'bowl', 8.3 , 'n/a', 'Bowl'),
(70, 'plate', 9.8 , 'n/a', 'Plate'),
(71, 'biggerPlate', 11.3 , 'n/a', 'Bigger Plate'),
(72, 'appBag', 0.0 , 'n/a', '')



ON CONFLICT (menuItemId)
DO UPDATE SET
    menuItem = EXCLUDED.menuItem,
    price = EXCLUDED.price,
    size = EXCLUDED.size,
    displayName = EXCLUDED.displayName;
;
