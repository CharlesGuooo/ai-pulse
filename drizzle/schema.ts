import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Uses GitHub OAuth - openId stores GitHub user ID.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const itemTypeEnum = pgEnum("item_type", ["tweet", "academic"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  /** GitHub OAuth user ID */
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  avatarUrl: text("avatar_url"),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User archives - stores saved tweets and academic projects per user.
 */
export const userArchives = pgTable("user_archives", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemType: itemTypeEnum("item_type").notNull(),
  itemId: varchar("item_id", { length: 128 }).notNull(),
  itemData: text("item_data").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserArchive = typeof userArchives.$inferSelect;
export type InsertUserArchive = typeof userArchives.$inferInsert;
