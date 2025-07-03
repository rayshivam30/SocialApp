import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Test basic database connection
    const result = await sql`SELECT NOW() as current_time, version() as postgres_version`

    // Test if users table exists
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `

    // Count users
    const userCount = await sql`SELECT COUNT(*) as count FROM users`

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        time: result[0]?.current_time,
        version: result[0]?.postgres_version,
      },
      tables: {
        usersTableExists: tableCheck.length > 0,
        userCount: userCount[0]?.count || 0,
      },
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: "Make sure DATABASE_URL is set and database is accessible",
      },
      { status: 500 },
    )
  }
}
