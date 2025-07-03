-- Simple sample data insertion without complex UPSERT operations

-- Insert communities (simple INSERT)
INSERT INTO communities (name, description, category, creator_id) VALUES
('Photography Masters', 'A community for photography enthusiasts', 'photography', 1),
('Dance Revolution', 'Share your dance moves and connect with dancers', 'dance', 2),
('Tech Talk', 'Discuss technology and programming', 'technology', 4),
('Fitness Journey', 'Track fitness goals and share workouts', 'fitness', 3);

-- Insert sample posts
INSERT INTO posts (user_id, content, post_type, hashtags) VALUES
(1, 'Just captured this amazing sunset! The colors were absolutely breathtaking. 🌅', 'personal', ARRAY['photography', 'nature', 'sunset']),
(2, 'New dance routine I have been working on! Combining contemporary with hip-hop elements. 💃', 'personal', ARRAY['dance', 'fitness', 'choreography']),
(4, 'Thoughts on the latest JavaScript frameworks and their impact on web development. 🚀', 'personal', ARRAY['tech', 'programming', 'javascript']),
(3, 'Hello everyone! Excited to be part of this amazing community. 👋', 'personal', ARRAY['welcome', 'community']),
(5, 'Golden hour magic at the local park. Sometimes the best shots are right in your neighborhood! 📸', 'personal', ARRAY['photography', 'goldenhour', 'local']),
(6, 'Just deployed my first Next.js 15 app! The new features are incredible. ⚡', 'personal', ARRAY['nextjs', 'webdev', 'deployment']);

-- Insert community memberships
INSERT INTO community_members (user_id, community_id, role) VALUES
(1, 1, 'admin'),
(2, 1, 'member'),
(3, 1, 'member'),
(5, 1, 'member'),
(2, 2, 'admin'),
(1, 2, 'member'),
(3, 2, 'member'),
(4, 3, 'admin'),
(6, 3, 'member'),
(3, 3, 'member'),
(3, 4, 'admin'),
(2, 4, 'member'),
(1, 4, 'member');

-- Insert followers
INSERT INTO followers (follower_id, following_id) VALUES
(3, 1),
(3, 2),
(3, 4),
(3, 5),
(3, 6),
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
(3, 1),
(3, 2),
(3, 4),
(1, 2),
(1, 6),
(2, 1),
(2, 4),
(4, 1),
(4, 2),
(5, 6),
(6, 1);

-- Add some sample comments
INSERT INTO comments (user_id, post_id, content) VALUES
(3, 1, 'Great post! Thanks for sharing.'),
(1, 2, 'Love this! Keep up the amazing work.'),
(2, 4, 'This is so inspiring! 💫'),
(4, 1, 'Awesome shot!'),
(5, 2, 'Amazing choreography!'),
(6, 1, 'Beautiful capture!');

-- Verify the data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Communities', COUNT(*) FROM communities
UNION ALL
SELECT 'Posts', COUNT(*) FROM posts
UNION ALL
SELECT 'Community Members', COUNT(*) FROM community_members
UNION ALL
SELECT 'Followers', COUNT(*) FROM followers
UNION ALL
SELECT 'Likes', COUNT(*) FROM likes
UNION ALL
SELECT 'Comments', COUNT(*) FROM comments;
