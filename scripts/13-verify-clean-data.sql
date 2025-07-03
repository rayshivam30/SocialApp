-- Verify the data was inserted correctly
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

-- Show sample users
SELECT 'Sample Users:' as info;
SELECT id, username, full_name, email FROM users ORDER BY id;

-- Show sample posts with authors
SELECT 'Sample Posts:' as info;
SELECT p.id, u.username, LEFT(p.content, 60) || '...' as content_preview, p.created_at 
FROM posts p 
JOIN users u ON p.user_id = u.id 
ORDER BY p.created_at DESC;

-- Show community memberships
SELECT 'Community Memberships:' as info;
SELECT c.name as community, u.username, cm.role 
FROM community_members cm
JOIN communities c ON cm.community_id = c.id
JOIN users u ON cm.user_id = u.id
ORDER BY c.name, cm.role;
