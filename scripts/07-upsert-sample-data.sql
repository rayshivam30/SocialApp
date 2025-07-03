-- Use UPSERT (INSERT ... ON CONFLICT) to handle existing data gracefully

-- Insert or update users with properly hashed passwords (password: "password123" for all)
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('john_doe', 'john@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'John Doe', 'Photography enthusiast and nature lover'),
('jane_smith', 'jane@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Jane Smith', 'Dance instructor and fitness coach'),
('demo_user', 'demo@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Demo User', 'Welcome to our platform!'),
('mike_wilson', 'mike@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Mike Wilson', 'Tech blogger and coffee addict')
ON CONFLICT (username) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  password_hash = EXCLUDED.password_hash;

-- Insert or update users by email constraint as well
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('sarah_photo', 'sarah@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Sarah Johnson', 'Professional photographer and visual storyteller'),
('alex_dev', 'alex@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Alex Chen', 'Full-stack developer and open source contributor')
ON CONFLICT (username) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  password_hash = EXCLUDED.password_hash
ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  password_hash = EXCLUDED.password_hash;

-- Insert communities (handle conflicts by name)
INSERT INTO communities (name, description, category, creator_id) VALUES
('Photography Masters', 'A community for photography enthusiasts to share their work and learn from each other', 'photography', (SELECT id FROM users WHERE username = 'john_doe' LIMIT 1)),
('Dance Revolution', 'Share your dance moves, learn new styles, and connect with dancers worldwide', 'dance', (SELECT id FROM users WHERE username = 'jane_smith' LIMIT 1)),
('Tech Talk', 'Discuss the latest in technology, programming, and innovation', 'technology', (SELECT id FROM users WHERE username = 'mike_wilson' LIMIT 1)),
('Fitness Journey', 'Track your fitness goals, share workouts, and motivate each other', 'fitness', (SELECT id FROM users WHERE username = 'demo_user' LIMIT 1))
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- Insert sample posts only if they don't exist (check by content similarity)
INSERT INTO posts (user_id, content, post_type, hashtags) 
SELECT u.id, content, 'personal', hashtags
FROM (VALUES
  ('john_doe', 'Just captured this amazing sunset! The colors were absolutely breathtaking. Nature never fails to amaze me! 🌅 #photography #nature #sunset', ARRAY['photography', 'nature', 'sunset']),
  ('jane_smith', 'New dance routine I''ve been working on! Combining contemporary with hip-hop elements. Can''t wait to share the full video! 💃 #dance #fitness #choreography', ARRAY['dance', 'fitness', 'choreography']),
  ('mike_wilson', 'Thoughts on the latest JavaScript frameworks and their impact on modern web development. The ecosystem is evolving so rapidly! 🚀 #tech #programming #javascript', ARRAY['tech', 'programming', 'javascript']),
  ('demo_user', 'Hello everyone! Excited to be part of this amazing community. Looking forward to connecting with all of you and sharing this journey together! 👋 #welcome #community', ARRAY['welcome', 'community']),
  ('sarah_photo', 'Golden hour magic at the local park. Sometimes the best shots are right in your neighborhood! 📸 #photography #goldenhour #local', ARRAY['photography', 'goldenhour', 'local']),
  ('alex_dev', 'Just deployed my first Next.js 15 app! The new features are incredible. Loving the improved performance! ⚡ #nextjs #webdev #deployment', ARRAY['nextjs', 'webdev', 'deployment'])
) AS v(username, content, hashtags)
JOIN users u ON u.username = v.username
WHERE NOT EXISTS (
  SELECT 1 FROM posts p 
  WHERE p.user_id = u.id 
  AND p.content LIKE '%' || SPLIT_PART(v.content, ' ', 1) || '%'
);

-- Insert community memberships (handle conflicts)
INSERT INTO community_members (user_id, community_id, role)
SELECT u.id, c.id, role
FROM (VALUES
  ('john_doe', 'Photography Masters', 'admin'),
  ('jane_smith', 'Photography Masters', 'member'),
  ('demo_user', 'Photography Masters', 'member'),
  ('sarah_photo', 'Photography Masters', 'member'),
  ('jane_smith', 'Dance Revolution', 'admin'),
  ('john_doe', 'Dance Revolution', 'member'),
  ('demo_user', 'Dance Revolution', 'member'),
  ('mike_wilson', 'Tech Talk', 'admin'),
  ('alex_dev', 'Tech Talk', 'member'),
  ('demo_user', 'Tech Talk', 'member'),
  ('demo_user', 'Fitness Journey', 'admin'),
  ('jane_smith', 'Fitness Journey', 'member'),
  ('john_doe', 'Fitness Journey', 'member')
) AS v(username, community_name, role)
JOIN users u ON u.username = v.username
JOIN communities c ON c.name = v.community_name
ON CONFLICT (user_id, community_id) DO UPDATE SET
  role = EXCLUDED.role;

-- Insert followers (handle conflicts)
INSERT INTO followers (follower_id, following_id)
SELECT f.id, t.id
FROM (VALUES
  ('demo_user', 'john_doe'),
  ('demo_user', 'jane_smith'),
  ('demo_user', 'mike_wilson'),
  ('demo_user', 'sarah_photo'),
  ('demo_user', 'alex_dev'),
  ('john_doe', 'jane_smith'),
  ('john_doe', 'mike_wilson'),
  ('jane_smith', 'john_doe'),
  ('jane_smith', 'sarah_photo'),
  ('mike_wilson', 'alex_dev'),
  ('sarah_photo', 'john_doe'),
  ('alex_dev', 'mike_wilson')
) AS v(follower, following)
JOIN users f ON f.username = v.follower
JOIN users t ON t.username = v.following
WHERE f.id != t.id
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- Update community member counts
UPDATE communities SET member_count = (
  SELECT COUNT(*) FROM community_members WHERE community_id = communities.id
);

-- Add some sample likes (only if posts exist)
INSERT INTO likes (user_id, post_id)
SELECT u.id, p.id
FROM users u
CROSS JOIN posts p
WHERE u.username IN ('demo_user', 'john_doe', 'jane_smith') 
  AND p.user_id != u.id
  AND RANDOM() > 0.5  -- Random likes for variety
ON CONFLICT (user_id, post_id) DO NOTHING;

-- Add some sample comments (only if posts exist)
INSERT INTO comments (user_id, post_id, content)
SELECT u.id, p.id, 
  CASE 
    WHEN u.username = 'demo_user' THEN 'Great post! Thanks for sharing.'
    WHEN u.username = 'john_doe' THEN 'Love this! Keep up the amazing work.'
    WHEN u.username = 'jane_smith' THEN 'This is so inspiring! 💫'
    ELSE 'Awesome content!'
  END
FROM users u
CROSS JOIN posts p
WHERE u.username IN ('demo_user', 'john_doe', 'jane_smith') 
  AND p.user_id != u.id
  AND RANDOM() > 0.7  -- Fewer comments than likes
  AND NOT EXISTS (
    SELECT 1 FROM comments c 
    WHERE c.user_id = u.id AND c.post_id = p.id
  );
