import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getUserArchives, addUserArchive, removeUserArchive } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  archive: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserArchives(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({
        itemType: z.enum(["tweet", "academic"]),
        itemId: z.string(),
        itemData: z.string(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await addUserArchive({
          userId: ctx.user.id,
          itemType: input.itemType,
          itemId: input.itemId,
          itemData: input.itemData,
          metadata: input.metadata ?? null,
        });
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({
        itemType: z.enum(["tweet", "academic"]),
        itemId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await removeUserArchive(ctx.user.id, input.itemType, input.itemId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
