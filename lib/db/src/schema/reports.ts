import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title"),
  description: text("description"),
  category: text("category"),
  reportDate: timestamp("report_date", { withTimezone: true }),
  missionaryId: integer("missionary_id").notNull().references(() => usersTable.id),
  peopleReached: integer("people_reached"),
  leadersTrainer: integer("leaders_trainer"),
  communitiesServed: integer("communities_served"),
  location: text("location"),
  visibility: text("visibility").notNull().default("public"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;
