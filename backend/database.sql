CREATE DATABASE IF NOT EXISTS fixmate_db;
USE fixmate_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  skill_category VARCHAR(100) NOT NULL,
  location VARCHAR(150),
  availability ENUM('Available','Busy','Offline') DEFAULT 'Available',
  rating FLOAT DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE service_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(100),
  description TEXT,
  location VARCHAR(150),
  status ENUM('Pending','Assigned','In Progress','Completed','Cancelled') DEFAULT 'Pending',
  assigned_worker_id INT NULL,
  service_type_id INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_worker_id) REFERENCES workers(id) ON DELETE SET NULL,
  FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE SET NULL
);

CREATE TABLE ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  rater_id INT NOT NULL,
  ratee_id INT NOT NULL,
  score TINYINT CHECK (score BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
);

CREATE TABLE admin_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action_type VARCHAR(100),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE workers 
  ADD COLUMN latitude DECIMAL(10,7) NULL,
  ADD COLUMN longitude DECIMAL(10,7) NULL;

ALTER TABLE service_requests 
  ADD COLUMN latitude DECIMAL(10,7) NULL,
  ADD COLUMN longitude DECIMAL(10,7) NULL;

UPDATE users SET role = 'admin' WHERE email = 'user1@example.com';

CREATE TABLE tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  worker_id INT NULL,
  token VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (token)
);

CREATE TABLE blacklisted_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) NOT NULL,
  user_id INT NULL,
  worker_id INT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN email_verified TINYINT DEFAULT 0;
ALTER TABLE workers ADD COLUMN email_verified TINYINT DEFAULT 0;

ALTER TABLE service_requests 
MODIFY COLUMN status 
ENUM('Pending', 'Assigned', 'Accepted', 'Cancelled', 'Completed') 
DEFAULT 'Pending';

ALTER TABLE users ADD phone VARCHAR(20);
ALTER TABLE workers ADD phone VARCHAR(20);
ALTER TABLE service_requests ADD user_has_rated BOOLEAN DEFAULT FALSE;

ALTER TABLE users ADD COLUMN profilePic LONGBLOB NULL;
ALTER TABLE workers ADD COLUMN profilePic LONGBLOB NULL;
ALTER TABLE service_requests ADD COLUMN problem_pic LONGBLOB NULL;
