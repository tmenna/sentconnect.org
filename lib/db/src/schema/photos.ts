import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { reportsTable } from "./reports";

export const photosTable = pgTable("photos", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull().references(() => reportsTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPhotoSchema = createInsertSchema(photosTable).omit({ id: true, createdAt: true });
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photosTable.$inferSelect;
