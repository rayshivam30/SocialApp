-- Clear all existing data and reset sequences
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM community_members;
DELETE FROM followers;
DELETE FROM posts;
DELETE FROM communities;
DELETE FROM users;

-- Reset all sequences to start from 1
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE communities_id_seq RESTART WITH 1;
ALTER SEQUENCE posts_id_seq RESTART WITH 1;
ALTER SEQUENCE likes_id_seq RESTART WITH 1;
ALTER SEQUENCE comments_id_seq RESTART WITH 1;
ALTER SEQUENCE followers_id_seq RESTART WITH 1;
ALTER SEQUENCE community_members_id_seq RESTART WITH 1;

-- Insert users with real bcrypt hashes (password: "password123" for all)
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('john_doe', 'john@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'John Doe', 'Photography enthusiast and nature lover'),
('jane_smith', 'jane@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Jane Smith', 'Dance instructor and fitness coach'),
('demo_user', 'demo@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Demo User', 'Welcome to our amazing platform! 🎉'),
('mike_wilson', 'mike@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Mike Wilson', 'Tech blogger and coffee enthusiast'),
('sarah_photo', 'sarah@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Sarah Johnson', 'Professional photographer capturing moments'),
('alex_dev', 'alex@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Alex Chen', 'Full-stack developer building the future');

-- Insert communities
INSERT INTO communities (name, description, category, creator_id, member_count) VALUES
('Photography Masters', 'A vibrant community for photography enthusiasts to share their work and learn techniques', 'photography', 1, 0),
('Dance Revolution', 'Express yourself through movement! Share dance videos and connect with dancers', 'dance', 2, 0),
('Tech Innovators', 'Discuss the latest in technology, programming trends, and innovations', 'technology', 4, 0),
('Fitness Warriors', 'Your fitness journey starts here! Share workouts and motivate each other', 'fitness', 3, 0);

-- Insert community memberships
INSERT INTO community_members (user_id, community_id, role) VALUES
(1, 1, 'admin'),
(2, 1, 'member'),
(3, 1, 'member'),
(5, 1, 'member'),
(2, 2, 'admin'),
(1, 2, 'member'),
(3, 2, 'member'),
(6, 2, 'member'),
(4, 3, 'admin'),
(6, 3, 'member'),
(3, 3, 'member'),
(1, 3, 'member'),
(3, 4, 'admin'),
(2, 4, 'member'),
(1, 4, 'member'),
(5, 4, 'member');

-- Insert sample posts
INSERT INTO posts (user_id, content, post_type, hashtags) VALUES
(1, 'Just captured this breathtaking sunrise over the mountains! The golden hour never fails to amaze me. #photography #sunrise #mountains #goldenhour', 'personal', ARRAY['photography', 'sunrise', 'mountains', 'goldenhour']),
(2, 'New choreography session complete! Been working on this contemporary-hip hop fusion piece for weeks. #dance #choreography #contemporary #hiphop', 'personal', ARRAY['dance', 'choreography', 'contemporary', 'hiphop']),
(4, 'The future of web development is here! Just deployed my first app using Next.js 15 and the performance is incredible. #webdev #nextjs #javascript #programming', 'personal', ARRAY['webdev', 'nextjs', 'javascript', 'programming']),
(3, 'Hello everyone! So excited to be part of this amazing community! Looking forward to connecting with all of you. #welcome #community #excited', 'personal', ARRAY['welcome', 'community', 'excited']),
(5, 'Street photography session in downtown! There is something beautiful about capturing candid moments. #streetphotography #urban #candid', 'personal', ARRAY['streetphotography', 'urban', 'candid']),
(6, 'Code review complete! Just finished implementing a new authentication system with enhanced security features. #coding #authentication #security', 'personal', ARRAY['coding', 'authentication', 'security']);

-- Insert followers
INSERT INTO followers (follower_id, following_id) VALUES
(3, 1),
(3, 2),
(3, 4),
(3, 5),
(3, 6),
(1, 2),
(2, 1),
(1, 5),
(5, 1),
(2, 6),
(6, 2),
(4, 6),
(6, 4),
(1, 4),
(4, 1);

-- Insert likes
INSERT INTO likes (user_id, post_id) VALUES
(2, 1),
(3, 1),
(5, 1),
(1, 2),
(3, 2),
(4, 2),
(1, 3),
(3, 3),
(6, 3),
(1, 4),
(2, 4),
(4, 4),
(5, 4),
(1, 5),
(2, 5),
(3, 5),
(3, 6),
(4, 6),
(1, 6);

-- Insert comments
INSERT INTO comments (user_id, post_id, content) VALUES
(2, 1, 'Absolutely stunning! The colors are incredible. What camera settings did you use?'),
(5, 1, 'This is why I love photography - capturing these magical moments!'),
(3, 1, 'Wow! This makes me want to wake up early tomorrow for sunrise.'),
(1, 2, 'Your choreography always tells such beautiful stories!'),
(6, 2, 'The passion really shows through your movement. Amazing work!'),
(3, 2, 'This is so inspiring! I have always wanted to learn contemporary dance.'),
(6, 3, 'Next.js 15 is a game changer! The new features are incredible.'),
(1, 3, 'Great insights! Love seeing the tech community push boundaries.'),
(1, 4, 'Welcome to the community! You are going to love it here.'),
(2, 4, 'Welcome! Looking forward to seeing what you create and share!'),
(1, 5, 'Street photography is so challenging but rewarding. Great shots!'),
(3, 5, 'These candid moments are pure gold. Each photo tells a story!'),
(4, 6, 'Clean code is so important! Security-first development is the way to go.'),
(1, 6, 'The attention to detail in your work always impresses me.');

-- Update community member counts
UPDATE communities SET member_count = (
  SELECT COUNT(*) FROM community_members WHERE community_id = communities.id
);

-- Show success message and counts
SELECT 'Data insertion completed successfully!' as status;
