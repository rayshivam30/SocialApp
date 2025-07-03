-- Complete clean setup script with proper dependency order
-- This script will clean all data and insert fresh sample data

BEGIN;

-- Step 1: Clean all data in reverse dependency order
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM hashtags;
DELETE FROM community_members;
DELETE FROM followers;
DELETE FROM posts;
DELETE FROM communities;
DELETE FROM users;

-- Step 2: Reset all sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE communities_id_seq RESTART WITH 1;
ALTER SEQUENCE posts_id_seq RESTART WITH 1;
ALTER SEQUENCE comments_id_seq RESTART WITH 1;
ALTER SEQUENCE likes_id_seq RESTART WITH 1;
ALTER SEQUENCE community_members_id_seq RESTART WITH 1;
ALTER SEQUENCE followers_id_seq RESTART WITH 1;
ALTER SEQUENCE hashtags_id_seq RESTART WITH 1;

-- Step 3: Insert users first (no dependencies)
INSERT INTO users (username, email, password_hash, full_name, bio, profile_picture_url, is_private) VALUES
('demo_user', 'demo@example.com', 'simple_hash_123', 'Demo User', 'Welcome to my profile! I love sharing thoughts and connecting with others.', '/placeholder.svg?height=100&width=100', false),
('jane_smith', 'jane@example.com', 'simple_hash_456', 'Jane Smith', 'Tech enthusiast and coffee lover ☕', '/placeholder.svg?height=100&width=100', false),
('mike_johnson', 'mike@example.com', 'simple_hash_789', 'Mike Johnson', 'Photographer capturing life''s beautiful moments 📸', '/placeholder.svg?height=100&width=100', false),
('sarah_wilson', 'sarah@example.com', 'simple_hash_abc', 'Sarah Wilson', 'Fitness coach helping you reach your goals 💪', '/placeholder.svg?height=100&width=100', false),
('alex_brown', 'alex@example.com', 'simple_hash_def', 'Alex Brown', 'Software developer building the future 🚀', '/placeholder.svg?height=100&width=100', false),
('emma_davis', 'emma@example.com', 'simple_hash_ghi', 'Emma Davis', 'Artist painting the world with colors 🎨', '/placeholder.svg?height=100&width=100', false);

-- Step 4: Insert communities (depends on users for creator_id)
INSERT INTO communities (name, description, category, creator_id, is_private, cover_image_url, member_count) VALUES
('Tech Enthusiasts', 'A community for technology lovers to share and discuss the latest trends', 'technology', 1, false, '/placeholder.svg?height=200&width=400', 0),
('Photography Club', 'Share your best shots and learn from fellow photographers', 'photography', 3, false, '/placeholder.svg?height=200&width=400', 0),
('Fitness Journey', 'Support each other on our fitness and wellness journey', 'fitness', 4, false, '/placeholder.svg?height=200&width=400', 0),
('Creative Arts', 'A space for artists to showcase their work and inspire others', 'art', 6, false, '/placeholder.svg?height=200&width=400', 0);

-- Step 5: Insert posts (depends on users and communities)
INSERT INTO posts (user_id, content, community_id, image_url, post_type, hashtags) VALUES
(1, 'Just joined this amazing platform! Excited to connect with everyone 🎉', 1, '/placeholder.svg?height=300&width=500', 'text', ARRAY['welcome', 'newbie', 'excited']),
(2, 'Beautiful sunset from my evening walk. Nature never fails to amaze me! 🌅', 2, '/placeholder.svg?height=400&width=600', 'image', ARRAY['sunset', 'nature', 'photography']),
(3, 'Captured this amazing street art downtown. The colors are incredible! 🎨', 4, '/placeholder.svg?height=400&width=600', 'image', ARRAY['streetart', 'photography', 'urban']),
(4, 'Finished my morning workout! 30 minutes of HIIT and feeling energized 💪', 3, NULL, 'text', ARRAY['fitness', 'workout', 'motivation']),
(5, 'Working on a new React project. The component architecture is coming together nicely! ⚛️', 1, NULL, 'text', ARRAY['react', 'coding', 'webdev']),
(6, 'Latest painting in progress. Still working on the details but loving how it''s turning out! 🖼️', 4, '/placeholder.svg?height=400&width=400', 'image', ARRAY['painting', 'art', 'creative']);

-- Step 6: Insert community members (depends on users and communities)
INSERT INTO community_members (user_id, community_id, role) VALUES
(1, 1, 'admin'),    -- demo_user is admin of Tech Enthusiasts
(2, 1, 'member'),   -- jane_smith joins Tech Enthusiasts
(5, 1, 'member'),   -- alex_brown joins Tech Enthusiasts
(3, 2, 'admin'),    -- mike_johnson is admin of Photography Club
(2, 2, 'member'),   -- jane_smith joins Photography Club
(6, 2, 'member'),   -- emma_davis joins Photography Club
(4, 3, 'admin'),    -- sarah_wilson is admin of Fitness Journey
(1, 3, 'member'),   -- demo_user joins Fitness Journey
(5, 3, 'member'),   -- alex_brown joins Fitness Journey
(6, 4, 'admin'),    -- emma_davis is admin of Creative Arts
(3, 4, 'member'),   -- mike_johnson joins Creative Arts
(2, 4, 'member'),   -- jane_smith joins Creative Arts
(1, 4, 'member');   -- demo_user joins Creative Arts

-- Step 7: Insert followers (depends on users)
INSERT INTO followers (follower_id, following_id) VALUES
(1, 2), -- demo_user follows jane_smith
(1, 3), -- demo_user follows mike_johnson
(1, 4), -- demo_user follows sarah_wilson
(2, 1), -- jane_smith follows demo_user
(2, 3), -- jane_smith follows mike_johnson
(2, 6), -- jane_smith follows emma_davis
(3, 1), -- mike_johnson follows demo_user
(3, 2), -- mike_johnson follows jane_smith
(4, 1), -- sarah_wilson follows demo_user
(4, 5), -- sarah_wilson follows alex_brown
(5, 1), -- alex_brown follows demo_user
(6, 2); -- emma_davis follows jane_smith

-- Step 8: Insert likes (depends on users and posts)
INSERT INTO likes (user_id, post_id) VALUES
(2, 1), -- jane likes demo_user's welcome post
(3, 1), -- mike likes demo_user's welcome post
(4, 1), -- sarah likes demo_user's welcome post
(1, 2), -- demo_user likes jane's sunset post
(3, 2), -- mike likes jane's sunset post
(6, 2), -- emma likes jane's sunset post
(1, 3), -- demo_user likes mike's street art post
(2, 3), -- jane likes mike's street art post
(1, 4), -- demo_user likes sarah's workout post
(5, 4), -- alex likes sarah's workout post
(2, 5); -- jane likes alex's React post

-- Step 9: Insert comments (depends on users and posts)
INSERT INTO comments (user_id, post_id, content) VALUES
(2, 1, 'Welcome to the community! Looking forward to your posts 😊'),
(3, 1, 'Great to have you here! Feel free to share your photography work'),
(1, 2, 'Absolutely stunning! What camera did you use for this shot?'),
(6, 2, 'The colors are incredible! Nature is the best artist 🎨'),
(2, 3, 'Love the vibrant colors! Street art is so inspiring'),
(4, 5, 'React is amazing! Would love to see the final project when it''s done');

-- Step 10: Insert hashtags (independent)
INSERT INTO hashtags (name, usage_count) VALUES
('welcome', 1),
('newbie', 1),
('excited', 1),
('sunset', 1),
('nature', 1),
('photography', 2),
('streetart', 1),
('urban', 1),
('fitness', 1),
('workout', 1),
('motivation', 1),
('react', 1),
('coding', 1),
('webdev', 1),
('painting', 1),
('art', 2),
('creative', 1);

-- Step 11: Update community member counts
UPDATE communities SET member_count = (
    SELECT COUNT(*) FROM community_members WHERE community_id = communities.id
);

COMMIT;

-- Verification queries
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
SELECT 'Comments', COUNT(*) FROM comments
UNION ALL
SELECT 'Hashtags', COUNT(*) FROM hashtags;

-- Show sample data
SELECT 'Sample Users:' as info;
SELECT id, username, full_name, email FROM users LIMIT 5;

SELECT 'Sample Communities:' as info;
SELECT id, name, category, member_count FROM communities;

SELECT 'Sample Posts:' as info;
SELECT p.id, u.username, LEFT(p.content, 50) || '...' as content_preview 
FROM posts p JOIN users u ON p.user_id = u.id LIMIT 5;
