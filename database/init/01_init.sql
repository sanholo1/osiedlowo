-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create default admin user (password: admin123)
INSERT INTO users (id, email, password, firstName, lastName, role, isActive) 
VALUES (
    UUID(),
    'admin@osiedlowo.pl',
    '$2b$10$5QHzXhMWPxqXsCX.yI1XwemwjJ7S.oXlzx0ZyeGvLtgwO2Xr9H5hq',
    'Admin',
    'Administrator',
    'admin',
    true
);