import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { AnalysisEngine } from "./analysisEngine";
import { createAnalysisRecord, getAnalysisHistory, getAnalysisById } from "./db";
import { processUploadedFile, validateFile } from "./fileHandler";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  analysis: router({
    analyze: publicProcedure
    .input(
      z.object({
        text: z.string().min(1).max(50000),
      })
    )
    .mutation(async ({ input }) => {
      const engine = new AnalysisEngine();
      return engine.analyze(input.text);
    }),

    

    uploadFile: publicProcedure
      .input(
        z.object({
          filename: z.string(),
          fileData: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.fileData, "base64");
        const validation = validateFile(input.filename, buffer.length);

        if (!validation.valid) {
          throw new Error(validation.error || "Invalid file");
        }

        const text = await processUploadedFile(buffer, input.filename);

        if (!text.trim()) {
          throw new Error("No text content found in file");
        }

        const engine = new AnalysisEngine();
        const result = engine.analyze(text);

        

        return result;
      }),
  }),
});

export type AppRouter = typeof appRouter;
