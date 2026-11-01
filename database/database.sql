-- ========================================================
-- BUDGETBITE - DATABASE SCHEMA & INITIAL SEED DATA
-- Database Name: budgetbite
-- Target: MySQL 5.7+ / 8.0+ / MariaDB (XAMPP & phpMyAdmin)
-- ========================================================

DROP DATABASE IF EXISTS `budgetbite`;
CREATE DATABASE `budgetbite` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `budgetbite`;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `role` ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `addresses`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `address_line` VARCHAR(255) NOT NULL,
  `landmark` VARCHAR(150) DEFAULT NULL,
  `city` VARCHAR(100) NOT NULL DEFAULT 'Bengaluru',
  `state` VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
  `postal_code` VARCHAR(20) NOT NULL DEFAULT '560001',
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `categories`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `foods`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `foods`;
CREATE TABLE `foods` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `is_veg` TINYINT(1) NOT NULL DEFAULT 1,
  `is_available` TINYINT(1) NOT NULL DEFAULT 1,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `tags` VARCHAR(255) DEFAULT '',
  `rating` DECIMAL(3,2) NOT NULL DEFAULT 4.50,
  `rating_count` INT NOT NULL DEFAULT 18,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  INDEX `idx_foods_category` (`category_id`),
  INDEX `idx_foods_price` (`price`),
  INDEX `idx_foods_veg` (`is_veg`),
  INDEX `idx_foods_available` (`is_available`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `combos`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `combos`;
CREATE TABLE `combos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `original_price` DECIMAL(10,2) NOT NULL,
  `savings` DECIMAL(10,2) NOT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_combos_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `combo_items`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `combo_items`;
CREATE TABLE `combo_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `combo_id` INT NOT NULL,
  `food_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  FOREIGN KEY (`combo_id`) REFERENCES `combos` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `orders`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT DEFAULT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_email` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(20) NOT NULL,
  `delivery_address` TEXT NOT NULL,
  `delivery_instructions` TEXT DEFAULT NULL,
  `payment_method` ENUM('Cash on Delivery', 'Online Payment') NOT NULL DEFAULT 'Cash on Delivery',
  `payment_status` ENUM('Pending', 'Completed') NOT NULL DEFAULT 'Pending',
  `subtotal` DECIMAL(10,2) NOT NULL,
  `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 30.00,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `order_status` ENUM('Order Placed', 'Preparing Food', 'Out for Delivery', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Order Placed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_orders_user` (`user_id`),
  INDEX `idx_orders_status` (`order_status`),
  INDEX `idx_orders_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `order_items`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `food_id` INT DEFAULT NULL,
  `combo_id` INT DEFAULT NULL,
  `item_type` ENUM('food', 'combo') NOT NULL DEFAULT 'food',
  `item_name` VARCHAR(150) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`combo_id`) REFERENCES `combos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for `reviews`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `order_id` INT NOT NULL,
  `food_id` INT DEFAULT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`food_id`) REFERENCES `foods` (`id`) ON DELETE SET NULL,
  UNIQUE KEY `unique_user_order_review` (`user_id`, `order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- INITIAL SEED DATA
-- ========================================================

-- 1. Default Admin and Sample Customer
-- Admin: admin@budgetbite.com / Admin@123
-- Customer: customer@budgetbite.com / Customer@123
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`) VALUES
(1, 'BudgetBite Admin', 'admin@budgetbite.com', '$2a$10$5NrVbs1skc9IueMg7heMfOfB6bTG5bv5lq/BmWg369XB.AZw.mrau', '9876543210', 'admin'),
(2, 'Aditi Sharma', 'customer@budgetbite.com', '$2a$10$FvuYVws9/0sNzrxyHSgj3u8cCjDZ0tO.ucTK/7FHbwtCAWrF7zJaC', '9812345678', 'customer');

-- Customer Address
INSERT INTO `addresses` (`user_id`, `address_line`, `landmark`, `city`, `state`, `postal_code`, `is_default`) VALUES
(2, 'Flat 302, Green Glen Apartments, Bellandur', 'Near EcoSpace Tech Park', 'Bengaluru', 'Karnataka', '560103', 1);

-- 2. Food Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image_url`, `display_order`) VALUES
(1, 'Rice', 'rice', 'Hearty, aromatic, flavorful wok-tossed fried rice meals.', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', 1),
(2, 'Noodles', 'noodles', 'Wok-tossed noodles with fresh vegetables, egg, or chicken.', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80', 2),
(3, 'Starters', 'starters', 'Crispy, tangy, and sizzling appetizers to kickstart your meal.', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80', 3),
(4, 'Fast Food', 'fast-food', 'Crispy fries, gourmet stuffed sandwiches, and cheesy burgers.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 4),
(5, 'Pizza', 'pizza', 'Freshly baked hand-stretched pizzas topped with melted mozzarella.', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', 5),
(6, 'Drinks', 'drinks', 'Chilled carbonated refreshments and freshly squeezed pure fruit juices.', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', 6);

-- 3. Initial Foods (All 16 required items with high-res authentic images and crave tags)
INSERT INTO `foods` (`id`, `category_id`, `name`, `description`, `price`, `is_veg`, `is_available`, `image_url`, `tags`, `rating`, `rating_count`) VALUES
(1, 1, 'Veg Fried Rice', 'Aromatic basmati rice tossed with garden-fresh beans, carrots, and spring onions.', 80.00, 1, 1, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80', 'filling,light', 4.60, 42),
(2, 1, 'Egg Fried Rice', 'Classic stir-fried rice tossed with fluffy scrambled eggs, pepper, and garlic soy glaze.', 100.00, 0, 1, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', 'filling,spicy', 4.70, 38),
(3, 1, 'Chicken Fried Rice', 'Tender spiced chicken chunks tossed with long-grain rice, soy sauce, and scallions.', 130.00, 0, 1, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80', 'filling,spicy', 4.85, 65),

(4, 2, 'Veg Noodles', 'Hakka-style noodles tossed with crunchy julienned vegetables and subtle oriental spices.', 70.00, 1, 1, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80', 'filling,spicy', 4.50, 31),
(5, 2, 'Egg Noodles', 'Savory stir-fried noodles cooked with egg ribbons, shredded cabbage, and chili garlic paste.', 90.00, 0, 1, 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80', 'filling,spicy', 4.65, 29),
(6, 2, 'Chicken Noodles', 'Succulent shredded chicken tossed with silky noodles, crunchy peppers, and aromatic sauces.', 120.00, 0, 1, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80', 'filling,spicy', 4.80, 54),

(7, 3, 'Gobi Manchurian', 'Golden crispy cauliflower florets glazed in a hot, tangy Indo-Chinese Manchurian gravy.', 90.00, 1, 1, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80', 'crunchy,spicy', 4.75, 48),
(8, 3, 'Chicken Manchurian', 'Crispy batter-fried chicken bites tossed in rich ginger, garlic, cilantro, and dark soya glaze.', 140.00, 0, 1, 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=800&q=80', 'crunchy,spicy', 4.90, 72),

(9, 4, 'Burger', 'Crisp herb potato patty layered with crisp lettuce, sliced tomato, and zesty signature mayo sauce.', 80.00, 1, 1, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', 'cheesy,filling', 4.60, 44),
(10, 4, 'Sandwich', 'Toasted triple-decker sandwich loaded with sliced cucumbers, tomatoes, bell peppers, and mint chutney.', 60.00, 1, 1, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80', 'light,crunchy', 4.55, 33),
(11, 4, 'French Fries', 'Golden, salted, perfectly crisp potato batons served with homemade smoky dipping dip.', 50.00, 1, 1, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80', 'crunchy,light', 4.70, 60),

(12, 5, 'Veg Pizza', 'Crisp 8-inch hand-stretched crust topped with marinara, capsicum, onions, and golden sweet corn.', 120.00, 1, 1, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', 'cheesy,filling', 4.65, 39),
(13, 5, 'Cheese Pizza', 'Classic Margherita style loaded with double mozzarella, aromatic basil, and slow-simmered tomato sauce.', 140.00, 1, 1, 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80', 'cheesy,filling', 4.80, 52),
(14, 5, 'Paneer Pizza', 'Tandoori-spiced tender cottage cheese cubes, red onions, capsicum, and generous gooey mozzarella.', 150.00, 1, 1, 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&q=80', 'cheesy,filling,spicy', 4.85, 47),

(15, 6, 'Cool Drinks', 'Chilled carbonated refreshment (300ml bottle) to perfectly quench your thirst.', 30.00, 1, 1, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80', 'sweet,light', 4.50, 25),
(16, 6, 'Fresh Juice', 'Pure, freshly extracted seasonal fruit juice with no artificial concentrates.', 50.00, 1, 1, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80', 'sweet,light', 4.75, 41);

-- 4. Initial Combos
INSERT INTO `combos` (`id`, `name`, `description`, `price`, `original_price`, `savings`, `image_url`, `is_active`) VALUES
(1, 'Student Combo', 'Veg Noodles + Crispy French Fries + Chilled Cool Drink. Pocket friendly feast!', 99.00, 150.00, 51.00, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', 1),
(2, 'Budget Combo', 'Veg Fried Rice + Sizzling Gobi Manchurian + Chilled Cool Drink. The ultimate everyday value!', 149.00, 200.00, 51.00, 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80', 1),
(3, 'Family Combo', 'Chicken Fried Rice + Cheese Pizza + Crispy French Fries + Fresh Juice. Perfect shared meal!', 299.00, 370.00, 71.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', 1);

-- Combo Item mappings
-- Student Combo (id 1): Veg Noodles (id 4), French Fries (id 11), Cool Drinks (id 15)
INSERT INTO `combo_items` (`combo_id`, `food_id`, `quantity`) VALUES
(1, 4, 1),
(1, 11, 1),
(1, 15, 1);

-- Budget Combo (id 2): Veg Fried Rice (id 1), Gobi Manchurian (id 7), Cool Drinks (id 15)
INSERT INTO `combo_items` (`combo_id`, `food_id`, `quantity`) VALUES
(2, 1, 1),
(2, 7, 1),
(2, 15, 1);

-- Family Combo (id 3): Chicken Fried Rice (id 3), Cheese Pizza (id 13), French Fries (id 11), Fresh Juice (id 16)
INSERT INTO `combo_items` (`combo_id`, `food_id`, `quantity`) VALUES
(3, 3, 1),
(3, 13, 1),
(3, 11, 1),
(3, 16, 1);

-- 5. Sample Initial Orders & Reviews for Real Demonstration
INSERT INTO `orders` (`id`, `order_number`, `user_id`, `customer_name`, `customer_email`, `customer_phone`, `delivery_address`, `delivery_instructions`, `payment_method`, `payment_status`, `subtotal`, `delivery_fee`, `total_amount`, `order_status`, `created_at`) VALUES
(1, 'BB-20261031-1001', 2, 'Aditi Sharma', 'customer@budgetbite.com', '9812345678', 'Flat 302, Green Glen Apartments, Bellandur, Bengaluru - 560103', 'Please ring the doorbell and leave at door', 'Cash on Delivery', 'Completed', 180.00, 30.00, 210.00, 'Delivered', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 'BB-20261031-1002', 2, 'Aditi Sharma', 'customer@budgetbite.com', '9812345678', 'Flat 302, Green Glen Apartments, Bellandur, Bengaluru - 560103', 'Call on arrival', 'Cash on Delivery', 'Pending', 149.00, 30.00, 179.00, 'Preparing Food', NOW());

INSERT INTO `order_items` (`order_id`, `food_id`, `combo_id`, `item_type`, `item_name`, `unit_price`, `quantity`, `subtotal`) VALUES
(1, 3, NULL, 'food', 'Chicken Fried Rice', 130.00, 1, 130.00),
(1, 11, NULL, 'food', 'French Fries', 50.00, 1, 50.00),
(2, NULL, 2, 'combo', 'Budget Combo', 149.00, 1, 149.00);

-- Initial Verified Reviews
INSERT INTO `reviews` (`user_id`, `order_id`, `food_id`, `rating`, `comment`, `created_at`) VALUES
(2, 1, 3, 5, 'The Chicken Fried Rice was hot, delicious, and extremely filling for just ₹130! Loved the smart budget recommendation.', DATE_SUB(NOW(), INTERVAL 1 DAY));
