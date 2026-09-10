CREATE DATABASE IF NOT EXISTS fixmate_db;
USE fixmate_db;

-- =====================================
-- USERS
-- =====================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user','admin') DEFAULT 'user',
    email_verified TINYINT(1) DEFAULT 0,
    profilePic TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- WORKERS
-- =====================================
CREATE TABLE workers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,

    skill_category VARCHAR(100) NOT NULL,

    location VARCHAR(150),
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,

    availability ENUM('Available','Busy','Offline')
        DEFAULT 'Available',

    rating FLOAT DEFAULT 0,
    rating_count INT DEFAULT 0,

    email_verified TINYINT(1) DEFAULT 0,

    profilePic TEXT DEFAULT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- SERVICE TYPES
-- =====================================
CREATE TABLE service_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- =====================================
-- SERVICE REQUESTS
-- =====================================
CREATE TABLE service_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    category VARCHAR(100),
    service_type_id INT NULL,

    description TEXT,
    problem_pic TEXT DEFAULT NULL,

    location VARCHAR(150),
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,

    status ENUM(
        'Pending',
        'Assigned',
        'Accepted',
        'Cancelled',
        'Completed'
    ) DEFAULT 'Pending',

    assigned_worker_id INT NULL,

    user_has_rated BOOLEAN DEFAULT FALSE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_request_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_request_worker
        FOREIGN KEY (assigned_worker_id)
        REFERENCES workers(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_request_service_type
        FOREIGN KEY (service_type_id)
        REFERENCES service_types(id)
        ON DELETE SET NULL
);

-- =====================================
-- RATINGS
-- =====================================
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,

    request_id INT NOT NULL,

    rater_id INT NOT NULL,
    ratee_id INT NOT NULL,

    score TINYINT NOT NULL CHECK (score BETWEEN 1 AND 5),

    comment TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rating_request
        FOREIGN KEY (request_id)
        REFERENCES service_requests(id)
        ON DELETE CASCADE
);

-- =====================================
-- ADMIN LOGS
-- =====================================
CREATE TABLE admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,

    admin_id INT NOT NULL,

    action_type VARCHAR(100),

    description TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_admin_logs
        FOREIGN KEY (admin_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =====================================
-- EMAIL VERIFICATION / PASSWORD RESET TOKENS
-- =====================================
CREATE TABLE tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NULL,
    worker_id INT NULL,

    token VARCHAR(255) NOT NULL,

    type VARCHAR(50) NOT NULL,

    expires_at DATETIME,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_token(token)
);

-- =====================================
-- JWT BLACKLIST
-- =====================================
CREATE TABLE blacklisted_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,

    token VARCHAR(500) NOT NULL,

    user_id INT NULL,
    worker_id INT NULL,

    expires_at DATETIME NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- DEFAULT SERVICE TYPES
-- =====================================
INSERT INTO service_types(name, description)
VALUES
('Electrician','Electrical repair and installation'),
('Plumber','Plumbing repair and maintenance'),
('Cleaner','Home and office cleaning'),
('Painter','Painting services'),
('Carpenter','Furniture and woodwork'),
('Mechanic','Mechanical repair'),
('AC Repair','Air conditioner servicing'),
('Appliance Repair','Home appliance repair');

-- =====================================
-- MAKE FIRST USER ADMIN (OPTIONAL)
-- =====================================
UPDATE users
SET role='admin'
WHERE email='user1@example.com';