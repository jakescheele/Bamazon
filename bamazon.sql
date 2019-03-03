DROP DATABASE IF EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
    item_id integer auto_increment primary key,
    product_name varchar(85),
    department_name varchar(85),
    price integer(5),
    stock_quantity integer(5)
);

INSERT INTO 
products(product_name, department_name, price, stock_quantity)
VALUES 
("Power Bank 10,000mAh USB-C", "Electronics", 35, 50),
("Polaroid Portable Printer", "Electronics", 50, 150),
("Cooler Master", "Sports & Outdoors", 300, 100),
("Double Nest Hammock", "Sports & Outdoors", 90, 100),
("Columbia Jacket w/ Built In Toaster", "Clothing", 200, 50),
("Push Mower", "Home & Garden", 350, 30),
("Planted Cactus", "Home & Garden", 5, 300),
("Dog Collar Calorie  Tracker", "Pet Supplies", 60, 60);