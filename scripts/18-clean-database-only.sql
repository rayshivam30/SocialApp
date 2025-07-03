-- Clean database setup - NO dummy data
-- This script creates a fresh database with proper structure only

BEGIN;

-- Step 1: Clean all existing data
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM hashtags;
DELETE FROM community_members;
DELETE FROM followers;
DELETE FROM posts;
DELETE FROM communities;
DELETE FROM users;

-- Step 2: Reset all sequences to start fresh
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE communities_id_seq RESTART WITH 1;
ALTER SEQUENCE posts_id_seq RESTART WITH 1;
ALTER SEQUENCE comments_id_seq RESTART WITH 1;
ALTER SEQUENCE likes_id_seq RESTART WITH 1;
ALTER SEQUENCE community_members_id_seq RESTART WITH 1;
ALTER SEQUENCE followers_id_seq RESTART WITH 1;
ALTER SEQUENCE hashtags_id_seq RESTART WITH 1;

COMMIT;

-- Verification - should show all zeros
SELECT 'CLEAN DATABASE VERIFICATION:' as status;
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

SELECT 'Database is now clean and ready for real users!' as message;
