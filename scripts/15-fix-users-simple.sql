-- Simple user fix script without complex operations
-- Clear existing users safely
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM posts;
DELETE FROM community_members;
DELETE FROM followers;
DELETE FROM users;

-- Reset the users sequence
ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- Insert users with simple, working password hashes
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('john_doe', 'john@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP', 'John Doe', 'Photography enthusiast and nature lover'),
('jane_smith', 'jane@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP', 'Jane Smith', 'Dance instructor and fitness coach'),
('demo_user', 'demo@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP', 'Demo User', 'Welcome to our platform!'),
('mike_wilson', 'mike@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP', 'Mike Wilson', 'Tech blogger and coffee addict'),
('sarah_photo', 'sarah@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP', 'Sarah Johnson', 'Professional photographer'),
('alex_dev', 'alex@example.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOP', 'Alex Chen', 'Full-stack developer');

-- Verify users were created
SELECT COUNT(*) as user_count FROM users;
SELECT username, email, full_name FROM users;
