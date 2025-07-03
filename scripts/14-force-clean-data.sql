-- First, let's check what exists
DO $$
BEGIN
    -- Drop and recreate all tables to ensure clean state
    DROP TABLE IF EXISTS comments CASCADE;
    DROP TABLE IF EXISTS likes CASCADE;
    DROP TABLE IF EXISTS community_members CASCADE;
    DROP TABLE IF EXISTS followers CASCADE;
    DROP TABLE IF EXISTS posts CASCADE;
    DROP TABLE IF EXISTS communities CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS notifications CASCADE;
    DROP TABLE IF EXISTS hashtags CASCADE;
    DROP TABLE IF EXISTS user_analytics CASCADE;
END $$;

-- Recreate users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  bio TEXT,
  profile_picture_url TEXT,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recreate communities table
CREATE TABLE communities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  cover_image_url TEXT,
  creator_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recreate posts table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  post_type VARCHAR(20) DEFAULT 'personal',
  visibility VARCHAR(20) DEFAULT 'public',
  hashtags TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recreate followers table
CREATE TABLE followers (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id)
);

-- Recreate community_members table
CREATE TABLE community_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  community_id INTEGER REFERENCES communities(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, community_id)
);

-- Recreate likes table
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);

-- Recreate comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recreate other tables
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  related_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  related_post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hashtags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  posts_created INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  comments_received INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_community_id ON posts(community_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_community_members_user_id ON community_members(user_id);
CREATE INDEX idx_community_members_community_id ON community_members(community_id);
CREATE INDEX idx_posts_hashtags ON posts USING GIN(hashtags);

-- Now insert fresh data
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
(1, 'Just captured this breathtaking sunrise over the mountains! 🌄 The golden hour never fails to amaze me. There is something magical about being up early and witnessing nature daily masterpiece. #photography #sunrise #mountains #goldenhour', 'personal', ARRAY['photography', 'sunrise', 'mountains', 'goldenhour']),
(2, 'New choreography session complete! 💃 Been working on this contemporary-hip hop fusion piece for weeks. The energy, the flow, the story it tells through movement - dance is truly the language of the soul! #dance #choreography #contemporary #hiphop', 'personal', ARRAY['dance', 'choreography', 'contemporary', 'hiphop']),
(4, 'The future of web development is here! 🚀 Just deployed my first app using Next.js 15 and the performance improvements are incredible. The developer experience keeps getting better! #webdev #nextjs #javascript #programming', 'personal', ARRAY['webdev', 'nextjs', 'javascript', 'programming']),
(3, 'Hello everyone! 👋 So excited to be part of this amazing community! Looking forward to connecting with creative minds, sharing experiences, and learning from all of you. #welcome #community #excited', 'personal', ARRAY['welcome', 'community', 'excited']),
(5, 'Street photography session in downtown! 📸 There is something beautiful about capturing candid moments - the laughter of children, the rush of commuters, the quiet contemplation of strangers. #streetphotography #urban #candid', 'personal', ARRAY['streetphotography', 'urban', 'candid']),
(6, 'Code review complete! ✅ Just finished implementing a new authentication system with enhanced security features. Clean code, proper testing, and user experience - the holy trinity of great software development! #coding #authentication #security', 'personal', ARRAY['coding', 'authentication', 'security']);

-- Insert followers
INSERT INTO followers (follower_id, following_id) VALUES
(3, 1), (3, 2), (3, 4), (3, 5), (3, 6),
(1, 2), (2, 1), (1, 5), (5, 1), (2, 6), (6, 2),
(4, 6), (6, 4), (1, 4), (4, 1), (2, 5), (5, 2);

-- Insert likes
INSERT INTO likes (user_id, post_id) VALUES
(2, 1), (3, 1), (5, 1), (6, 1),
(1, 2), (3, 2), (4, 2), (6, 2),
(1, 3), (3, 3), (6, 3), (5, 3),
(1, 4), (2, 4), (4, 4), (5, 4), (6, 4),
(1, 5), (2, 5), (3, 5), (4, 5),
(3, 6), (4, 6), (1, 6), (2, 6);

-- Insert comments
INSERT INTO comments (user_id, post_id, content) VALUES
(2, 1, 'Absolutely stunning! The colors are incredible. What camera settings did you use?'),
(5, 1, 'This is why I love photography - capturing these magical moments! Beautiful composition.'),
(3, 1, 'Wow! This makes me want to wake up early tomorrow for sunrise. Inspiring!'),
(1, 2, 'Your choreography always tells such beautiful stories! Cannot wait to see the full video.'),
(6, 2, 'The passion really shows through your movement. Dance is such an amazing art form!'),
(3, 2, 'This is so inspiring! I have always wanted to learn contemporary dance.'),
(6, 3, 'Next.js 15 is a game changer! The new caching system alone is worth the upgrade.'),
(1, 3, 'As someone interested in web dev, this gives me hope that the tools keep getting better!'),
(3, 3, 'Great insights! Love seeing the tech community push boundaries.'),
(1, 4, 'Welcome to the community! You are going to love it here. So many talented people!'),
(2, 4, 'Welcome! Looking forward to seeing what you create and share with us!'),
(5, 4, 'Great to have you here! This community has been amazing for connecting with fellow creatives.'),
(1, 5, 'Street photography is so challenging but rewarding. Love how you captured the urban energy!'),
(3, 5, 'These candid moments are pure gold. Each photo really does tell a story!'),
(4, 6, 'Clean code is so underrated! Security-first development is the way to go.'),
(1, 6, 'The attention to detail in your work always impresses me. Great job!');

-- Update community member counts
UPDATE communities SET member_count = (
  SELECT COUNT(*) FROM community_members WHERE community_id = communities.id
);

-- Success message
SELECT 'Database recreated and populated successfully!' as status;
SELECT 'Users: ' || COUNT(*) FROM users;
SELECT 'Posts: ' || COUNT(*) FROM posts;
SELECT 'Communities: ' || COUNT(*) FROM communities;
SELECT 'Likes: ' || COUNT(*) FROM likes;
SELECT 'Comments: ' || COUNT(*) FROM comments;
