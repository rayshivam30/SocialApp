-- Insert sample users
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('john_doe', 'john@example.com', '$2b$10$example_hash_1', 'John Doe', 'Photography enthusiast and nature lover'),
('jane_smith', 'jane@example.com', '$2b$10$example_hash_2', 'Jane Smith', 'Dance instructor and fitness coach'),
('mike_wilson', 'mike@example.com', '$2b$10$example_hash_3', 'Mike Wilson', 'Tech blogger and coffee addict');

-- Insert sample communities
INSERT INTO communities (name, description, category, creator_id) VALUES
('Photography Masters', 'A community for photography enthusiasts to share their work', 'photography', 1),
('Dance Revolution', 'Share your dance moves and learn from others', 'dance', 2),
('Tech Talk', 'Discuss the latest in technology and programming', 'technology', 3);

-- Insert sample posts
INSERT INTO posts (user_id, content, post_type, hashtags) VALUES
(1, 'Just captured this amazing sunset! #photography #nature', 'personal', ARRAY['photography', 'nature']),
(2, 'New dance routine I''ve been working on #dance #fitness', 'personal', ARRAY['dance', 'fitness']),
(3, 'Thoughts on the latest JavaScript frameworks #tech #programming', 'personal', ARRAY['tech', 'programming']);

-- Insert community memberships
INSERT INTO community_members (user_id, community_id) VALUES
(1, 1), (2, 1), (3, 1),
(1, 2), (2, 2),
(2, 3), (3, 3);

-- Insert sample followers
INSERT INTO followers (follower_id, following_id) VALUES
(1, 2), (1, 3), (2, 1), (3, 1), (3, 2);
