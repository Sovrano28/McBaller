// app/actions.ts

"use server";

import { neon } from "@neondatabase/serverless";

/**
 * Neon Serverless Database Actions
 * 
 * This file contains server actions that use Neon's serverless driver
 * for direct SQL queries. This is useful for:
 * - Complex queries that are difficult with Prisma
 * - Performance-critical operations
 * - Custom aggregations and analytics
 * 
 * Make sure your .env.local file has:
 * DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
 * 
 * For Neon:
 * - Direct connection (migrations): ep-xxx.us-west-2.aws.neon.tech (port 5432)
 * - Pooler connection (app): ep-xxx-pooler.us-west-2.aws.neon.tech (port 6543)
 */

// Initialize Neon SQL client
// This uses the DATABASE_URL from your .env.local file
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(process.env.DATABASE_URL);

/**
 * Example: Get data from database using raw SQL
 * This is useful when you need to write custom queries
 * that Prisma doesn't handle well, or for performance-critical operations
 */
export async function getData() {
  try {
    // Example: Get all players with their stats
    const data = await sql`
      SELECT 
        p.id,
        p.name,
        p.username,
        p.position,
        COUNT(ls.id) as total_seasons,
        SUM(ls.goals) as total_goals,
        SUM(ls.assists) as total_assists
      FROM players p
      LEFT JOIN league_stats ls ON p.id = ls."playerId"
      GROUP BY p.id, p.name, p.username, p.position
      ORDER BY total_goals DESC
      LIMIT 10
    `;
    
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching data:", error);
    return { success: false, error: "Failed to fetch data" };
  }
}

/**
 * Example: Get organization statistics
 */
export async function getOrganizationStats(organizationId: string) {
  try {
    const stats = await sql`
      SELECT 
        COUNT(DISTINCT p.id) as total_players,
        COUNT(DISTINCT t.id) as total_teams,
        COUNT(DISTINCT c.id) as total_contracts,
        COUNT(DISTINCT e.id) as total_events
      FROM organizations o
      LEFT JOIN players p ON p."organizationId" = o.id
      LEFT JOIN teams t ON t."organizationId" = o.id
      LEFT JOIN contracts c ON c."organizationId" = o.id
      LEFT JOIN events e ON e."organizationId" = o.id
      WHERE o.id = ${organizationId}
    `;
    
    return { success: true, stats: stats[0] };
  } catch (error) {
    console.error("Error fetching organization stats:", error);
    return { success: false, error: "Failed to fetch organization stats" };
  }
}

/**
 * Example: Get upcoming events for an organization
 */
export async function getUpcomingEvents(organizationId: string, limit: number = 10) {
  try {
    const events = await sql`
      SELECT 
        e.id,
        e.title,
        e.type,
        e."startTime",
        e."endTime",
        e.location,
        e.status,
        t.name as team_name
      FROM events e
      LEFT JOIN teams t ON t.id = e."teamId"
      WHERE e."organizationId" = ${organizationId}
        AND e."startTime" > NOW()
        AND e.status = 'scheduled'
      ORDER BY e."startTime" ASC
      LIMIT ${limit}
    `;
    
    return { success: true, events };
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return { success: false, error: "Failed to fetch upcoming events" };
  }
}

/**
 * Example: Get player performance metrics
 */
export async function getPlayerPerformance(playerId: string) {
  try {
    const performance = await sql`
      SELECT 
        ls.season,
        ls.club,
        ls.appearances,
        ls.goals,
        ls.assists,
        ls.yellow_cards,
        ls.red_cards,
        ROUND(
          CASE 
            WHEN ls.appearances > 0 
            THEN (ls.goals::numeric + ls.assists::numeric) / ls.appearances 
            ELSE 0 
          END, 
          2
        ) as goals_per_game
      FROM league_stats ls
      WHERE ls."playerId" = ${playerId}
      ORDER BY ls.season DESC
    `;
    
    return { success: true, performance };
  } catch (error) {
    console.error("Error fetching player performance:", error);
    return { success: false, error: "Failed to fetch player performance" };
  }
}

/**
 * Example: Get player by username with full details
 * This shows how to join multiple tables for complex data retrieval
 */
export async function getPlayerByUsernameWithDetails(username: string) {
  try {
    const player = await sql`
      SELECT 
        p.id,
        p.name,
        p.username,
        p.position,
        p."currentLocation",
        p."subscriptionTier",
        u.email,
        o.name as organization_name,
        o.slug as organization_slug,
        t.name as team_name,
        COUNT(DISTINCT ls.id) as total_seasons,
        SUM(ls.goals) as total_goals,
        SUM(ls.assists) as total_assists,
        SUM(ls.appearances) as total_appearances
      FROM players p
      INNER JOIN users u ON u.id = p."userId"
      LEFT JOIN organizations o ON o.id = p."organizationId"
      LEFT JOIN teams t ON t.id = p."teamId"
      LEFT JOIN league_stats ls ON ls."playerId" = p.id
      WHERE p.username = ${username}
      GROUP BY 
        p.id, p.name, p.username, p.position, p."currentLocation", 
        p."subscriptionTier", u.email, o.name, o.slug, t.name
    `;
    
    if (player.length === 0) {
      return { success: false, error: "Player not found" };
    }
    
    return { success: true, player: player[0] };
  } catch (error) {
    console.error("Error fetching player details:", error);
    return { success: false, error: "Failed to fetch player details" };
  }
}

/**
 * Example: Batch insert operation
 * Useful for bulk data operations
 */
export async function batchInsertEvents(events: Array<{
  organizationId: string;
  title: string;
  type: string;
  startTime: Date;
  endTime: Date;
  location?: string;
}>) {
  try {
    const results = [];
    
    for (const event of events) {
      const result = await sql`
        INSERT INTO events (
          id,
          "organizationId",
          title,
          type,
          "startTime",
          "endTime",
          location,
          status,
          "isAllDay",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          gen_random_uuid()::text,
          ${event.organizationId},
          ${event.title},
          ${event.type},
          ${event.startTime},
          ${event.endTime},
          ${event.location || null},
          'scheduled',
          false,
          NOW(),
          NOW()
        )
        RETURNING id, title
      `;
      
      results.push(result[0]);
    }
    
    return { success: true, inserted: results };
  } catch (error) {
    console.error("Error batch inserting events:", error);
    return { success: false, error: "Failed to batch insert events" };
  }
}

