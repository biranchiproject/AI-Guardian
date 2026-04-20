import { pgTable, text, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const analysesTable = pgTable("analyses", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  confidence: real("confidence").notNull(),
  riskLevel: text("risk_level").notNull(),
  alertMessage: text("alert_message").notNull(),
  analyzedText: text("analyzed_text").notNull(),
  analyzerType: text("analyzer_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAnalysisSchema = createInsertSchema(analysesTable).omit({ id: true, createdAt: true });
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysesTable.$inferSelect;
