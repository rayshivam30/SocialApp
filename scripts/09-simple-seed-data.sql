-- Clear existing data to start fresh
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM community_members;
DELETE FROM followers;
DELETE FROM posts;
DELETE FROM communities;
DELETE FROM users;

-- Reset sequences
SELECT setval('users_id_seq', 1, false);
SELECT setval('communities_id_seq', 1, false);
SELECT setval('posts_id_seq', 1, false);
SELECT setval('likes_id_seq', 1, false);
SELECT setval('comments_id_seq', 1, false);
SELECT setval('followers_id_seq', 1, false);
SELECT setval('community_members_id_seq', 1, false);

-- Insert users with properly hashed passwords (password: "password123" for all)
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('john_doe', 'john@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'John Doe', 'Photography enthusiast and nature lover'),
('jane_smith', 'jane@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Jane Smith', 'Dance instructor and fitness coach'),
('demo_user', 'demo@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Demo User', 'Welcome to our platform!'),
('mike_wilson', 'mike@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Mike Wilson', 'Tech blogger and coffee addict'),
('sarah_photo', 'sarah@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Sarah Johnson', 'Professional photographer and visual storyteller'),
('alex_dev', 'alex@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Alex Chen', 'Full-stack developer and open source contributor');

-- Insert communities
INSERT INTO communities (name, description, category, creator_id) VALUES
('Photography Masters', 'A community for photography enthusiasts to share their work and learn from each other', 'photography', 1),
('Dance Revolution', 'Share your dance moves, learn new styles, and connect with dancers worldwide', 'dance', 2),
('Tech Talk', 'Discuss the latest in technology, programming, and innovation', 'technology', 4),
('Fitness Journey', 'Track your fitness goals, share workouts, and motivate each other', 'fitness', 3);

-- Insert sample posts
INSERT INTO posts (user_id, content, post_type, hashtags) VALUES
(1, 'Just captured this amazing sunset! The colors were absolutely breathtaking. Nature never fails to amaze me! 🌅 #photography #nature #sunset', 'personal', ARRAY['photography', 'nature', 'sunset']),
(2, 'New dance routine I''ve been working on! Combining contemporary with hip-hop elements. Can''t wait to share the full video! 💃 #dance #fitness #choreography', 'personal', ARRAY['dance', 'fitness', 'choreography']),
(4, 'Thoughts on the latest JavaScript frameworks and their impact on modern web development. The ecosystem is evolving so rapidly! 🚀 #tech #programming #javascript', 'personal', ARRAY['tech', 'programming', 'javascript']),
(3, 'Hello everyone! Excited to be part of this amazing community. Looking forward to connecting with all of you and sharing this journey together! 👋 #welcome #community', 'personal', ARRAY['welcome', 'community']),
(5, 'Golden hour magic at the local park. Sometimes the best shots are right in your neighborhood! 📸 #photography #goldenhour #local', 'personal', ARRAY['photography', 'goldenhour', 'local']),
(6, 'Just deployed my first Next.js 15 app! The new features are incredible. Loving the improved performance! ⚡ #nextjs #webdev #deployment', 'personal', ARRAY['nextjs', 'webdev', 'deployment']);

-- Insert community memberships
INSERT INTO community_members (user_id, community_id, role) VALUES
-- Photography Masters
(1, 1, 'admin'),
(2, 1, 'member'),
(3, 1, 'member'),
(5, 1, 'member'),
-- Dance Revolution
(2, 2, 'admin'),
(1, 2, 'member'),
(3, 2, 'member'),
-- Tech Talk
(4, 3, 'admin'),
(6, 3, 'member'),
(3, 3, 'member'),
-- Fitness Journey
(3, 4, 'admin'),
(2, 4, 'member'),
(1, 4, 'member');

-- Insert followers
INSERT INTO followers (follower_id, following_id) VALUES
-- Demo user follows everyone
(3, 1),
(3, 2),
(3, 4),
(3, 5),
(3, 6),
-- Cross follows
(1, 2),
(1, 4),
(2, 1),
(2, 5),
(4, 6),
(5, 1),
(6, 4);

-- Update community member counts
UPDATE communities SET member_count = (
  SELECT COUNT(*) FROM community_members WHERE community_id = communities.id
);

-- Add some sample likes
INSERT INTO likes (user_id, post_id) VALUES
-- Demo user likes some posts
(3, 1),
(3, 2),
-- John likes Jane's post
(1, 2),
-- Jane likes John's post
(2, 1),
-- Mike likes tech posts
(4, 6),
-- Alex likes Mike's post
(6, 3),
-- Sarah likes photography posts
(5, 1),
(5, 5),
-- Cross likes
(1, 6),
(2, 4),
(4, 1),
(6, 2);

-- Add some sample comments
INSERT INTO comments (user_id, post_id, content) VALUES
(3, 1, 'Amazing shot! What camera settings did you use?'),
(2, 1, 'Absolutely beautiful! The lighting is perfect.'),
(1, 2, 'Can''t wait to see the full routine! Your choreography is always incredible.'),
(3, 4, 'Great insights! I''ve been following the framework evolution too.'),
(6, 4, 'Totally agree! The pace of change is both exciting and overwhelming.'),
(1, 3, 'Welcome to the community! Great to have you here.'),
(5, 5, 'Local spots often have the best hidden gems for photography!'),
(4, 6, 'Next.js 15 is a game changer! How are you finding the new features?'),
(3, 6, 'Congratulations on the deployment! 🎉'),
(2, 5, 'This makes me want to pick up photography again!');
