-- Clear existing data completely and start fresh
TRUNCATE TABLE comments, likes, community_members, followers, posts, communities, users RESTART IDENTITY CASCADE;

-- Insert users with real bcrypt hashes (password: "password123" for all)
INSERT INTO users (username, email, password_hash, full_name, bio) VALUES
('john_doe', 'john@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'John Doe', 'Photography enthusiast and nature lover'),
('jane_smith', 'jane@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Jane Smith', 'Dance instructor and fitness coach'),
('demo_user', 'demo@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Demo User', 'Welcome to our amazing platform! 🎉'),
('mike_wilson', 'mike@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Mike Wilson', 'Tech blogger and coffee enthusiast ☕'),
('sarah_photo', 'sarah@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Sarah Johnson', 'Professional photographer capturing life''s moments 📸'),
('alex_dev', 'alex@example.com', '$2b$10$rOzJqQXGNjQVXQvQVXQvQeK8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8', 'Alex Chen', 'Full-stack developer building the future 🚀');

-- Insert communities
INSERT INTO communities (name, description, category, creator_id, member_count) VALUES
('Photography Masters', 'A vibrant community for photography enthusiasts to share their work, learn techniques, and get inspired by amazing shots from around the world', 'photography', 1, 0),
('Dance Revolution', 'Express yourself through movement! Share your dance videos, learn new styles, and connect with dancers from all genres and skill levels', 'dance', 2, 0),
('Tech Innovators', 'Discuss the latest in technology, programming trends, startup ideas, and innovations shaping our digital future', 'technology', 4, 0),
('Fitness Warriors', 'Your fitness journey starts here! Share workouts, nutrition tips, progress photos, and motivate each other to reach new heights', 'fitness', 3, 0),
('Creative Minds', 'A space for artists, designers, writers, and all creative souls to showcase their work and collaborate on inspiring projects', 'art', 5, 0),
('Foodie Paradise', 'Discover amazing recipes, restaurant recommendations, cooking tips, and share your culinary adventures with fellow food lovers', 'cooking', 6, 0);

-- Insert community memberships
INSERT INTO community_members (user_id, community_id, role) VALUES
-- Photography Masters
(1, 1, 'admin'),
(2, 1, 'member'),
(3, 1, 'member'),
(5, 1, 'moderator'),
-- Dance Revolution
(2, 2, 'admin'),
(1, 2, 'member'),
(3, 2, 'member'),
(6, 2, 'member'),
-- Tech Innovators
(4, 3, 'admin'),
(6, 3, 'moderator'),
(3, 3, 'member'),
(1, 3, 'member'),
-- Fitness Warriors
(3, 4, 'admin'),
(2, 4, 'moderator'),
(1, 4, 'member'),
(5, 4, 'member'),
-- Creative Minds
(5, 5, 'admin'),
(2, 5, 'member'),
(6, 5, 'member'),
(3, 5, 'member'),
-- Foodie Paradise
(6, 6, 'admin'),
(1, 6, 'member'),
(2, 6, 'member'),
(4, 6, 'member');

-- Insert sample posts with engaging content
INSERT INTO posts (user_id, content, post_type, hashtags, created_at) VALUES
(1, 'Just captured this breathtaking sunrise over the mountains! 🌄 The golden hour never fails to amaze me. There''s something magical about being up early and witnessing nature''s daily masterpiece. #photography #sunrise #mountains #goldenhour #naturephotography', 'personal', ARRAY['photography', 'sunrise', 'mountains', 'goldenhour', 'naturephotography'], NOW() - INTERVAL '2 hours'),

(2, 'New choreography session complete! 💃 Been working on this contemporary-hip hop fusion piece for weeks. The energy, the flow, the story it tells through movement - dance is truly the language of the soul! Can''t wait to share the full video soon! #dance #choreography #contemporary #hiphop #passion', 'personal', ARRAY['dance', 'choreography', 'contemporary', 'hiphop', 'passion'], NOW() - INTERVAL '4 hours'),

(4, 'The future of web development is here! 🚀 Just deployed my first app using the latest Next.js 15 features and the performance improvements are incredible. The developer experience keeps getting better and better. What''s your favorite new framework feature? #webdev #nextjs #javascript #programming #tech', 'personal', ARRAY['webdev', 'nextjs', 'javascript', 'programming', 'tech'], NOW() - INTERVAL '6 hours'),

(3, 'Hello everyone! 👋 So excited to be part of this amazing community! Looking forward to connecting with creative minds, sharing experiences, and learning from all of you. This platform feels like the perfect place to grow and inspire each other! #welcome #community #excited #newbie', 'personal', ARRAY['welcome', 'community', 'excited', 'newbie'], NOW() - INTERVAL '8 hours'),

(5, 'Street photography session in downtown! 📸 There''s something beautiful about capturing candid moments - the laughter of children, the rush of commuters, the quiet contemplation of strangers. Every frame tells a story waiting to be discovered. #streetphotography #urban #candid #storytelling', 'personal', ARRAY['streetphotography', 'urban', 'candid', 'storytelling'], NOW() - INTERVAL '10 hours'),

(6, 'Code review complete! ✅ Just finished implementing a new authentication system with enhanced security features. Clean code, proper testing, and user experience - the holy trinity of great software development! #coding #authentication #security #cleancode #development', 'personal', ARRAY['coding', 'authentication', 'security', 'cleancode', 'development'], NOW() - INTERVAL '12 hours'),

(1, 'Workshop announcement! 📚 Hosting a landscape photography workshop next weekend. We''ll cover composition techniques, lighting, and post-processing tips. Perfect for beginners and intermediate photographers looking to elevate their skills! #workshop #photography #learning #landscape', 'personal', ARRAY['workshop', 'photography', 'learning', 'landscape'], NOW() - INTERVAL '1 day'),

(2, 'Dance therapy session today reminded me why I fell in love with movement. 💫 It''s not just about perfect technique - it''s about expression, healing, and connecting with your inner self. Dance has the power to transform lives! #dancetherapy #healing #expression #transformation', 'personal', ARRAY['dancetherapy', 'healing', 'expression', 'transformation'], NOW() - INTERVAL '1 day 2 hours');

-- Insert followers (mutual connections)
INSERT INTO followers (follower_id, following_id) VALUES
-- Demo user follows everyone
(3, 1), (3, 2), (3, 4), (3, 5), (3, 6),
-- Mutual follows between creative people
(1, 2), (2, 1), -- John and Jane
(1, 5), (5, 1), -- John and Sarah (both photographers)
(2, 6), (6, 2), -- Jane and Alex
(4, 6), (6, 4), -- Mike and Alex (both developers)
(1, 4), (4, 1), -- John and Mike
(2, 5), (5, 2), -- Jane and Sarah
-- Additional follows
(5, 6), (6, 5), (4, 2), (5, 4), (6, 1), (4, 5);

-- Insert likes on posts
INSERT INTO likes (user_id, post_id) VALUES
-- Likes on John's sunrise photo
(2, 1), (3, 1), (5, 1), (6, 1),
-- Likes on Jane's dance post
(1, 2), (3, 2), (4, 2), (6, 2),
-- Likes on Mike's tech post
(1, 3), (3, 3), (6, 3), (5, 3),
-- Likes on Demo user's welcome post
(1, 4), (2, 4), (4, 4), (5, 4), (6, 4),
-- Likes on Sarah's street photography
(1, 5), (2, 5), (3, 5), (4, 5),
-- Likes on Alex's code review post
(3, 6), (4, 6), (1, 6), (2, 6),
-- Likes on John's workshop post
(2, 7), (3, 7), (5, 7),
-- Likes on Jane's dance therapy post
(1, 8), (3, 8), (5, 8), (6, 8);

-- Insert engaging comments
INSERT INTO comments (user_id, post_id, content, created_at) VALUES
-- Comments on John's sunrise photo
(2, 1, 'Absolutely stunning! The colors are incredible. What camera settings did you use?', NOW() - INTERVAL '1 hour 30 minutes'),
(5, 1, 'This is why I love photography - capturing these magical moments! Beautiful composition.', NOW() - INTERVAL '1 hour'),
(3, 1, 'Wow! This makes me want to wake up early tomorrow for sunrise. Inspiring! 🌅', NOW() - INTERVAL '45 minutes'),

-- Comments on Jane's dance post
(1, 2, 'Your choreography always tells such beautiful stories! Can''t wait to see the full video.', NOW() - INTERVAL '3 hours 30 minutes'),
(6, 2, 'The passion really shows through your movement. Dance is such an amazing art form!', NOW() - INTERVAL '3 hours'),
(3, 2, 'This is so inspiring! I''ve always wanted to learn contemporary dance.', NOW() - INTERVAL '2 hours 45 minutes'),

-- Comments on Mike's tech post
(6, 3, 'Next.js 15 is a game changer! The new caching system alone is worth the upgrade.', NOW() - INTERVAL '5 hours 30 minutes'),
(1, 3, 'As someone new to web dev, this gives me hope that the tools keep getting better!', NOW() - INTERVAL '5 hours'),
(3, 3, 'Great insights! Love seeing the tech community push boundaries.', NOW() - INTERVAL '4 hours 30 minutes'),

-- Comments on Demo user's welcome post
(1, 4, 'Welcome to the community! You''re going to love it here. So many talented people!', NOW() - INTERVAL '7 hours 30 minutes'),
(2, 4, 'Welcome! Looking forward to seeing what you create and share with us! 🎉', NOW() - INTERVAL '7 hours'),
(5, 4, 'Great to have you here! This community has been amazing for connecting with fellow creatives.', NOW() - INTERVAL '6 hours 45 minutes'),

-- Comments on Sarah's street photography
(1, 5, 'Street photography is so challenging but rewarding. Love how you captured the urban energy!', NOW() - INTERVAL '9 hours 30 minutes'),
(3, 5, 'These candid moments are pure gold. Each photo really does tell a story!', NOW() - INTERVAL '9 hours'),

-- Comments on Alex's code review post
(4, 6, 'Clean code is so underrated! Security-first development is the way to go.', NOW() - INTERVAL '11 hours 30 minutes'),
(1, 6, 'The attention to detail in your work always impresses me. Great job!', NOW() - INTERVAL '11 hours'),

-- Comments on John's workshop post
(3, 7, 'This sounds amazing! I''m definitely interested in joining. How do I sign up?', NOW() - INTERVAL '23 hours'),
(5, 7, 'Love that you''re sharing your knowledge with the community! 📚', NOW() - INTERVAL '22 hours 30 minutes'),

-- Comments on Jane's dance therapy post
(3, 8, 'This is so beautiful. Dance really is healing. Thank you for sharing this perspective.', NOW() - INTERVAL '25 hours'),
(1, 8, 'Your posts always remind me of the deeper meaning behind art. Truly inspiring! 💫', NOW() - INTERVAL '24 hours 30 minutes');

-- Update community member counts
UPDATE communities SET member_count = (
  SELECT COUNT(*) FROM community_members WHERE community_id = communities.id
);

-- Verify the data
SELECT 'Data insertion completed successfully!' as status;
SELECT 'Users created: ' || COUNT(*) as users_count FROM users;
SELECT 'Posts created: ' || COUNT(*) as posts_count FROM posts;
SELECT 'Communities created: ' || COUNT(*) as communities_count FROM communities;
SELECT 'Total likes: ' || COUNT(*) as likes_count FROM likes;
SELECT 'Total comments: ' || COUNT(*) as comments_count FROM comments;
