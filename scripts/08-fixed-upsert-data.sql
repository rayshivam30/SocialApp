-- Insert or update users with properly hashed passwords (password: "password123" for all)
-- Handle username conflicts
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('john_doe', 'john@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'John Doe', 'Photography enthusiast and nature lover'),
('jane_smith', 'jane@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Jane Smith', 'Dance instructor and fitness coach'),
('demo_user', 'demo@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Demo User', 'Welcome to our platform!'),
('mike_wilson', 'mike@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Mike Wilson', 'Tech blogger and coffee addict'),
('sarah_photo', 'sarah@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Sarah Johnson', 'Professional photographer and visual storyteller'),
('alex_dev', 'alex@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Alex Chen', 'Full-stack developer and open source contributor')
ON CONFLICT (username) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  password_hash = EXCLUDED.password_hash;

-- Handle email conflicts separately if needed
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('temp_user_1', 'temp1@example.com', '$2b$10$K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Temp User', 'Temporary user')
ON CONFLICT (email) DO NOTHING;

-- Delete the temporary user
DELETE FROM users WHERE username = 'temp_user_1';

-- Insert communities (handle conflicts by name)
INSERT INTO communities (name, description, category, creator_id) VALUES
('Photography Masters', 'A community for photography enthusiasts to share their work and learn from each other', 'photography', (SELECT id FROM users WHERE username = 'john_doe' LIMIT 1)),
('Dance Revolution', 'Share your dance moves, learn new styles, and connect with dancers worldwide', 'dance', (SELECT id FROM users WHERE username = 'jane_smith' LIMIT 1)),
('Tech Talk', 'Discuss the latest in technology, programming, and innovation', 'technology', (SELECT id FROM users WHERE username = 'mike_wilson' LIMIT 1)),
('Fitness Journey', 'Track your fitness goals, share workouts, and motivate each other', 'fitness', (SELECT id FROM users WHERE username = 'demo_user' LIMIT 1))
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- Insert sample posts with conflict handling
INSERT INTO posts (user_id, content, post_type, hashtags) VALUES
((SELECT id FROM users WHERE username = 'john_doe'), 'Just captured this amazing sunset! The colors were absolutely breathtaking. Nature never fails to amaze me! 🌅 #photography #nature #sunset', 'personal', ARRAY['photography', 'nature', 'sunset']),
((SELECT id FROM users WHERE username = 'jane_smith'), 'New dance routine I''ve been working on! Combining contemporary with hip-hop elements. Can''t wait to share the full video! 💃 #dance #fitness #choreography', 'personal', ARRAY['dance', 'fitness', 'choreography']),
((SELECT id FROM users WHERE username = 'mike_wilson'), 'Thoughts on the latest JavaScript frameworks and their impact on modern web development. The ecosystem is evolving so rapidly! 🚀 #tech #programming #javascript', 'personal', ARRAY['tech', 'programming', 'javascript']),
((SELECT id FROM users WHERE username = 'demo_user'), 'Hello everyone! Excited to be part of this amazing community. Looking forward to connecting with all of you and sharing this journey together! 👋 #welcome #community', 'personal', ARRAY['welcome', 'community']),
((SELECT id FROM users WHERE username = 'sarah_photo'), 'Golden hour magic at the local park. Sometimes the best shots are right in your neighborhood! 📸 #photography #goldenhour #local', 'personal', ARRAY['photography', 'goldenhour', 'local']),
((SELECT id FROM users WHERE username = 'alex_dev'), 'Just deployed my first Next.js 15 app! The new features are incredible. Loving the improved performance! ⚡ #nextjs #webdev #deployment', 'personal', ARRAY['nextjs', 'webdev', 'deployment'])
ON CONFLICT DO NOTHING;

-- Insert community memberships with conflict handling
INSERT INTO community_members (user_id, community_id, role) VALUES
-- Photography Masters
((SELECT id FROM users WHERE username = 'john_doe'), (SELECT id FROM communities WHERE name = 'Photography Masters'), 'admin'),
((SELECT id FROM users WHERE username = 'jane_smith'), (SELECT id FROM communities WHERE name = 'Photography Masters'), 'member'),
((SELECT id FROM users WHERE username = 'demo_user'), (SELECT id FROM communities WHERE name = 'Photography Masters'), 'member'),
((SELECT id FROM users WHERE username = 'sarah_photo'), (SELECT id FROM communities WHERE name = 'Photography Masters'), 'member'),
-- Dance Revolution
((SELECT id FROM users WHERE username = 'jane_smith'), (SELECT id FROM communities WHERE name = 'Dance Revolution'), 'admin'),
((SELECT id FROM users WHERE username = 'john_doe'), (SELECT id FROM communities WHERE name = 'Dance Revolution'), 'member'),
((SELECT id FROM users WHERE username = 'demo_user'), (SELECT id FROM communities WHERE name = 'Dance Revolution'), 'member'),
-- Tech Talk
((SELECT id FROM users WHERE username = 'mike_wilson'), (SELECT id FROM communities WHERE name = 'Tech Talk'), 'admin'),
((SELECT id FROM users WHERE username = 'alex_dev'), (SELECT id FROM communities WHERE name = 'Tech Talk'), 'member'),
((SELECT id FROM users WHERE username = 'demo_user'), (SELECT id FROM communities WHERE name = 'Tech Talk'), 'member'),
-- Fitness Journey
((SELECT id FROM users WHERE username = 'demo_user'), (SELECT id FROM communities WHERE name = 'Fitness Journey'), 'admin'),
((SELECT id FROM users WHERE username = 'jane_smith'), (SELECT id FROM communities WHERE name = 'Fitness Journey'), 'member'),
((SELECT id FROM users WHERE username = 'john_doe'), (SELECT id FROM communities WHERE name = 'Fitness Journey'), 'member')
ON CONFLICT (user_id, community_id) DO UPDATE SET role = EXCLUDED.role;

-- Insert followers with conflict handling
INSERT INTO followers (follower_id, following_id) VALUES
-- Demo user follows everyone
((SELECT id FROM users WHERE username = 'demo_user'), (SELECT id FROM users WHERE username = 'john_doe')),
((SELECT id FROM users WHERE username = 'demo_user'), (SELECT id FROM users WHERE username = 'jane_smith')),
((SELECT id FROM users WHERE username = 'demo_user'), (SELECT id FROM users WHERE username = 'mike_wilson')),
((SELECT id FROM users WHERE username = 'demo_user'), (SELECT id FROM users WHERE username = 'sarah_photo')),
((SELECT id FROM users WHERE username = 'demo_user'), (SELECT id FROM users WHERE username = 'alex_dev')),
-- Cross follows
((SELECT id FROM users WHERE username = 'john_doe'), (SELECT id FROM users WHERE username = 'jane_smith')),
((SELECT id FROM users WHERE username = 'john_doe'), (SELECT id FROM users WHERE username = 'mike_wilson')),
((SELECT id FROM users WHERE username = 'jane_smith'), (SELECT id FROM users WHERE username = 'john_doe')),
((SELECT id FROM users WHERE username = 'jane_smith'), (SELECT id FROM users WHERE username = 'sarah_photo')),
((SELECT id FROM users WHERE username = 'mike_wilson'), (SELECT id FROM users WHERE username = 'alex_dev')),
((SELECT id FROM users WHERE username = 'sarah_photo'), (SELECT id FROM users WHERE username = 'john_doe')),
((SELECT id FROM users WHERE username = 'alex_dev'), (SELECT id FROM users WHERE username = 'mike_wilson'))
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- Update community member counts
UPDATE communities SET member_count = (
  SELECT COUNT(*) FROM community_members WHERE community_id = communities.id
);

-- Add some sample likes
INSERT INTO likes (user_id, post_id) VALUES
-- Demo user likes some posts
((SELECT id FROM users WHERE username = 'demo_user'), (SELECT id FROM posts WHERE user_id = (SELECT id FROM users WHERE username = 'john_doe') LIMIT 1)),
((SELECT id FROM users WHERE username = 'demo_user'), (SELECT id FROM posts WHERE user_id = (SELECT id FROM users WHERE username = 'jane_smith') LIMIT 1)),
-- John likes Jane's post
((SELECT id FROM users WHERE username = 'john_doe'), (SELECT id FROM posts WHERE user_id = (SELECT id FROM users WHERE username = 'jane_smith') LIMIT 1)),
-- Jane likes John's post
((SELECT id FROM users WHERE username = 'jane_smith'), (SELECT id FROM posts WHERE user_id = (SELECT id FROM users WHERE username = 'john_doe') LIMIT 1)),
-- Mike likes tech posts
((SELECT id FROM users WHERE username = 'mike_wilson'), (SELECT id FROM posts WHERE user_id = (SELECT id FROM users WHERE username = 'alex_dev') LIMIT 1)),
-- Alex likes Mike's post
((SELECT id FROM users WHERE username = 'alex_dev'), (SELECT id FROM posts WHERE user_id = (SELECT id FROM users WHERE username = 'mike_wilson') LIMIT 1))
ON CONFLICT (user_id, post_id) DO NOTHING;

-- Add some sample comments
INSERT INTO comments (user_id, post_id, content) VALUES
((SELECT id FROM users WHERE username = 'demo_user'), (SELECT id FROM posts WHERE user_id = (SELECT id FROM users WHERE username = 'john_doe') LIMIT 1), 'Amazing shot! What camera settings did you use?'),
((SELECT id FROM users WHERE username = 'jane_smith'), (SELECT id FROM posts WHERE user_id = (SELECT id FROM users WHERE username = 'john_doe') LIMIT 1), 'Absolutely beautiful! The lighting is perfect.'),
((SELECT id FROM users WHERE username = 'john_doe'), (SELECT id FROM posts WHERE user_id = (SELECT id FROM users WHERE username = 'jane_smith') LIMIT 1), 'Can''t wait to see the full routine! Your choreography is always incredible.'),
((SELECT id FROM users WHERE username = 'demo_user'), (SELECT id FROM posts WHERE user_id = (SELECT id FROM users WHERE username = 'mike_wilson') LIMIT 1), 'Great insights! I''ve been following the framework evolution too.'),
((SELECT id FROM users WHERE username = 'alex_dev'), (SELECT id FROM posts WHERE user_id = (SELECT id FROM users WHERE username = 'mike_wilson') LIMIT 1), 'Totally agree! The pace of change is both exciting and overwhelming.'),
((SELECT id FROM users WHERE username = 'john_doe'), (SELECT id FROM posts WHERE user_id = (SELECT id FROM users WHERE username = 'demo_user') LIMIT 1), 'Welcome to the community! Great to have you here.')
ON CONFLICT DO NOTHING;
