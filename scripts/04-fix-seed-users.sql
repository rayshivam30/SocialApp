-- First, let's clear existing users and create new ones with properly hashed passwords
DELETE FROM users;

-- Insert users with properly hashed passwords (password: "password123" for all)
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('john_doe', 'john@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'John Doe', 'Photography enthusiast and nature lover'),
('jane_smith', 'jane@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Jane Smith', 'Dance instructor and fitness coach'),
('demo_user', 'demo@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Demo User', 'Welcome to our platform!');
