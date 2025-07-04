import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Database helper functions with better error handling
export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function getUserById(id: number) {
  try {
    const result = await sql`
      SELECT id, username, email, full_name, bio, profile_picture_url, is_private, created_at 
      FROM users WHERE id = ${id} LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function getUserByUsername(username: string) {
  try {
    const result = await sql`
      SELECT id, username, email, full_name, bio, profile_picture_url, is_private, created_at 
      FROM users WHERE username = ${username} LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting user by username:", error)
    return null
  }
}

export async function createUser(userData: {
  username: string
  email: string
  password_hash: string
  full_name?: string
}) {
  try {
    const result = await sql`
      INSERT INTO users (username, email, password_hash, full_name)
      VALUES (${userData.username}, ${userData.email}, ${userData.password_hash}, ${userData.full_name || ""})
      RETURNING id, username, email, full_name, created_at
    `
    return result[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function getFeedPosts(userId: number, limit = 20, offset = 0) {
  try {
    const result = await sql`
      SELECT 
        p.*,
        u.username,
        u.full_name,
        u.profile_picture_url,
        c.name as community_name,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (SELECT COUNT(*) > 0 FROM likes WHERE post_id = p.id AND user_id = ${userId}) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN communities c ON p.community_id = c.id
      WHERE 
        p.user_id IN (
          SELECT following_id FROM followers WHERE follower_id = ${userId}
          UNION
          SELECT ${userId}
        )
        OR p.community_id IN (
          SELECT community_id FROM community_members WHERE user_id = ${userId}
        )
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result
  } catch (error) {
    console.error("Error getting feed posts:", error)
    return []
  }
}

export async function createPost(postData: {
  user_id: number
  content: string
  community_id?: number
  image_url?: string
  post_type: string
  hashtags: string[]
}) {
  try {
    const result = await sql`
      INSERT INTO posts (user_id, content, community_id, image_url, post_type, hashtags)
      VALUES (${postData.user_id}, ${postData.content}, ${postData.community_id || null}, 
              ${postData.image_url || null}, ${postData.post_type}, ${postData.hashtags})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

export async function toggleLike(userId: number, postId: number) {
  try {
    // Check if like exists
    const existingLike = await sql`
      SELECT id FROM likes WHERE user_id = ${userId} AND post_id = ${postId}
    `

    if (existingLike.length > 0) {
      // Remove like
      await sql`DELETE FROM likes WHERE user_id = ${userId} AND post_id = ${postId}`
      return { liked: false }
    } else {
      // Add like
      await sql`INSERT INTO likes (user_id, post_id) VALUES (${userId}, ${postId})`
      return { liked: true }
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    throw error
  }
}

export async function addComment(commentData: {
  user_id: number
  post_id: number
  content: string
}) {
  try {
    const result = await sql`
      INSERT INTO comments (user_id, post_id, content)
      VALUES (${commentData.user_id}, ${commentData.post_id}, ${commentData.content})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error adding comment:", error)
    throw error
  }
}

export async function getPostComments(postId: number) {
  try {
    const result = await sql`
      SELECT 
        c.*,
        u.username,
        u.full_name,
        u.profile_picture_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ${postId}
      ORDER BY c.created_at ASC
    `
    return result
  } catch (error) {
    console.error("Error getting post comments:", error)
    return []
  }
}

export async function searchUsers(query: string, limit = 10) {
  try {
    const result = await sql`
      SELECT id, username, full_name, profile_picture_url, bio
      FROM users
      WHERE username ILIKE ${"%" + query + "%"} OR full_name ILIKE ${"%" + query + "%"}
      LIMIT ${limit}
    `
    return result
  } catch (error) {
    console.error("Error searching users:", error)
    return []
  }
}

export async function searchCommunities(query: string, limit = 10) {
  try {
    const result = await sql`
      SELECT id, name, description, category, cover_image_url, member_count
      FROM communities
      WHERE name ILIKE ${"%" + query + "%"} OR description ILIKE ${"%" + query + "%"}
      LIMIT ${limit}
    `
    return result
  } catch (error) {
    console.error("Error searching communities:", error)
    return []
  }
}

export async function getUserCommunities(userId: number) {
  try {
    const result = await sql`
      SELECT 
        c.*,
        cm.role,
        cm.joined_at
      FROM communities c
      JOIN community_members cm ON c.id = cm.community_id
      WHERE cm.user_id = ${userId}
      ORDER BY cm.joined_at DESC
    `
    return result
  } catch (error) {
    console.error("Error getting user communities:", error)
    return []
  }
}

export async function followUser(followerId: number, followingId: number) {
  try {
    await sql`
      INSERT INTO followers (follower_id, following_id)
      VALUES (${followerId}, ${followingId})
    `
    return { success: true }
  } catch (error) {
    console.error("Error following user:", error)
    return { success: false, error: "Already following or invalid user" }
  }
}

export async function unfollowUser(followerId: number, followingId: number) {
  try {
    await sql`
      DELETE FROM followers 
      WHERE follower_id = ${followerId} AND following_id = ${followingId}
    `
    return { success: true }
  } catch (error) {
    console.error("Error unfollowing user:", error)
    return { success: false, error: "Error unfollowing user" }
  }
}

export async function getCommunityPosts(communityId: number, limit = 20, offset = 0) {
  try {
    const result = await sql`
      SELECT 
        p.*,
        u.username,
        u.full_name,
        u.profile_picture_url,
        c.name as community_name,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        false as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN communities c ON p.community_id = c.id
      WHERE p.community_id = ${communityId}
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result
  } catch (error) {
    console.error("Error getting community posts:", error)
    return []
  }
}

export async function sendMessage(senderId: number, receiverId: number, content: string) {
  try {
    const result = await sql`
      INSERT INTO messages (sender_id, receiver_id, content)
      VALUES (${senderId}, ${receiverId}, ${content})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

export async function getMessagesBetweenUsers(userId1: number, userId2: number, limit = 50, offset = 0) {
  try {
    const result = await sql`
      SELECT * FROM messages
      WHERE (sender_id = ${userId1} AND receiver_id = ${userId2})
         OR (sender_id = ${userId2} AND receiver_id = ${userId1})
      ORDER BY created_at ASC
      LIMIT ${limit} OFFSET ${offset}
    `
    return result
  } catch (error) {
    console.error("Error fetching messages:", error)
    return []
  }
}

export async function getMessageConversations(userId: number) {
  try {
    // Get distinct user IDs from sent and received messages
    const result = await sql`
      SELECT DISTINCT u.id, u.username, u.full_name, u.profile_picture_url
      FROM users u
      WHERE u.id IN (
        SELECT receiver_id FROM messages WHERE sender_id = ${userId}
        UNION
        SELECT sender_id FROM messages WHERE receiver_id = ${userId}
      ) AND u.id != ${userId}
    `
    return result
  } catch (error) {
    console.error("Error getting message conversations:", error)
    return []
  }
}

export async function searchFollowedUsers(userId: number, query: string, limit = 10) {
  try {
    const result = await sql`
      SELECT u.id, u.username, u.full_name, u.profile_picture_url, u.bio
      FROM users u
      JOIN followers f ON u.id = f.following_id
      WHERE f.follower_id = ${userId}
        AND (u.username ILIKE ${"%" + query + "%"} OR u.full_name ILIKE ${"%" + query + "%"})
      LIMIT ${limit}
    `
    return result
  } catch (error) {
    console.error("Error searching followed users:", error)
    return []
  }
}
