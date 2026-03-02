import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { InsertUser, users, userArchives, InsertUserArchive } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export function getDb() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!_db && dbUrl) {
    try {
      const sql = neon(dbUrl);
      _db = drizzle(sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);

    if (existing.length > 0) {
      // Update existing user
      await db.update(users)
        .set({
          name: user.name ?? existing[0].name,
          email: user.email ?? existing[0].email,
          avatarUrl: user.avatarUrl ?? existing[0].avatarUrl,
          loginMethod: user.loginMethod ?? existing[0].loginMethod,
          lastSignedIn: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.openId, user.openId));
    } else {
      // Insert new user
      await db.insert(users).values({
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        avatarUrl: user.avatarUrl ?? null,
        loginMethod: user.loginMethod ?? "github",
        role: "user",
        lastSignedIn: new Date(),
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== Archive Queries =====

export async function getUserArchives(userId: number) {
  const db = getDb();
  if (!db) return [];
  return db.select().from(userArchives).where(eq(userArchives.userId, userId)).orderBy(userArchives.createdAt);
}

export async function addUserArchive(data: InsertUserArchive) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userArchives).values(data);
}

export async function removeUserArchive(userId: number, itemType: "tweet" | "academic", itemId: string) {
  const db = getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(userArchives).where(
    and(
      eq(userArchives.userId, userId),
      eq(userArchives.itemType, itemType as "tweet" | "academic"),
      eq(userArchives.itemId, itemId)
    )
  );
}

export async function isItemArchived(userId: number, itemType: "tweet" | "academic", itemId: string) {
  const db = getDb();
  if (!db) return false;
  const result = await db.select().from(userArchives).where(
    and(
      eq(userArchives.userId, userId),
      eq(userArchives.itemType, itemType as "tweet" | "academic"),
      eq(userArchives.itemId, itemId)
    )
  ).limit(1);
  return result.length > 0;
}
