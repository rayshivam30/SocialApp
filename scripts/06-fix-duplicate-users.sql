-- Clear existing data to avoid duplicates
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM community_members;
DELETE FROM followers;
DELETE FROM posts;
DELETE FROM communities;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE communities_id_seq RESTART WITH 1;
ALTER SEQUENCE posts_id_seq RESTART WITH 1;

-- Insert users with properly hashed passwords (password: "password123" for all)
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('john_doe', 'john@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'John Doe', 'Photography enthusiast and nature lover'),
('jane_smith', 'jane@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Jane Smith', 'Dance instructor and fitness coach'),
('demo_user', 'demo@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Demo User', 'Welcome to our platform!'),
('mike_wilson', 'mike@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Mike Wilson', 'Tech blogger and coffee addict');

-- Insert sample communities
INSERT INTO communities (name, description, category, creator_id) VALUES
('Photography Masters', 'A community for photography enthusiasts to share their work', 'photography', 1),
('Dance Revolution', 'Share your dance moves and learn from others', 'dance', 2),
('Tech Talk', 'Discuss the latest in technology and programming', 'technology', 4);

-- Insert sample posts
INSERT INTO posts (user_id, content, post_type, hashtags) VALUES
(1, 'Just captured this amazing sunset! The colors were absolutely breathtaking. #photography #nature #sunset', 'personal', ARRAY['photography', 'nature', 'sunset']),
(2, 'New dance routine I''ve been working on! Can''t wait to share it with everyone. #dance #fitness #choreography', 'personal', ARRAY['dance', 'fitness', 'choreography']),
(4, 'Thoughts on the latest JavaScript frameworks and their impact on modern web development #tech #programming #javascript', 'personal', ARRAY['tech', 'programming', 'javascript']),
(3, 'Hello everyone! Excited to be part of this amazing community. Looking forward to connecting with all of you! #welcome #community', 'personal', ARRAY['welcome', 'community']);

-- Insert community memberships
INSERT INTO community_members (user_id, community_id, role) VALUES
(1, 1, 'admin'), (2, 1, 'member'), (3, 1, 'member'), (4, 1, 'member'),
(1, 2, 'member'), (2, 2, 'admin'), (3, 2, 'member'),
(2, 3, 'member'), (4, 3, 'admin'), (3, 3, 'member');

-- Insert sample followers
INSERT INTO followers (follower_id, following_id) VALUES
(1, 2), (1, 4), (2, 1), (2, 4), (3, 1), (3, 2), (3, 4), (4, 1), (4, 2);

-- Insert sample likes
INSERT INTO likes (user_id, post_id) VALUES
(2, 1), (3, 1), (4, 1),
(1, 2), (3, 2), (4, 2),
(1, 3), (2, 3), (3, 3),
(1, 4), (2, 4), (4, 4);

-- Insert sample comments
INSERT INTO comments (user_id, post_id, content) VALUES
(2, 1, 'Absolutely stunning! What camera did you use?'),
(3, 1, 'Beautiful shot! I love the lighting.'),
(1, 2, 'Amazing moves! Can''t wait to see the full routine.'),
(4, 2, 'This looks incredible! Keep it up!'),
(2, 3, 'Great insights! I totally agree about the framework trends.'),
(1, 4, 'Welcome to the community! Great to have you here.');

-- Update community member counts
UPDATE communities SET member_count = (
  SELECT COUNT(*) FROM community_members WHERE community_id = communities.id
);
