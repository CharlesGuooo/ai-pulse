import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Mock the db module
vi.mock("./db", () => ({
  getUserArchives: vi.fn().mockResolvedValue([]),
  addUserArchive: vi.fn().mockResolvedValue(undefined),
  removeUserArchive: vi.fn().mockResolvedValue(undefined),
}));

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("archive router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("archive.list", () => {
    it("returns empty array for authenticated user with no archives", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.archive.list();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    it("rejects unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.archive.list()).rejects.toThrow();
    });
  });

  describe("archive.add", () => {
    it("adds a tweet archive for authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.archive.add({
        itemType: "tweet",
        itemId: "tweet-123",
        itemData: JSON.stringify({ id: "tweet-123", content_summary: "Test tweet" }),
        metadata: JSON.stringify({ name: "Test User", handle: "testuser" }),
      });
      expect(result).toEqual({ success: true });
    });

    it("adds an academic archive for authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.archive.add({
        itemType: "academic",
        itemId: "paper-456",
        itemData: JSON.stringify({ id: "paper-456", title: "Test Paper" }),
      });
      expect(result).toEqual({ success: true });
    });

    it("rejects unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.archive.add({
          itemType: "tweet",
          itemId: "tweet-123",
          itemData: "{}",
        })
      ).rejects.toThrow();
    });

    it("rejects invalid itemType", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.archive.add({
          itemType: "invalid" as any,
          itemId: "test-123",
          itemData: "{}",
        })
      ).rejects.toThrow();
    });
  });

  describe("archive.remove", () => {
    it("removes an archive item for authenticated user", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.archive.remove({
        itemType: "tweet",
        itemId: "tweet-123",
      });
      expect(result).toEqual({ success: true });
    });

    it("rejects unauthenticated users", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);
      await expect(
        caller.archive.remove({
          itemType: "tweet",
          itemId: "tweet-123",
        })
      ).rejects.toThrow();
    });
  });
});
