import { pgTable, serial, integer, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const notificationLogsTable = pgTable("notification_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  recipientId: integer("recipient_id").references(() => usersTable.id, { onDelete: "cascade" }),
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  relatedPostId: integer("related_post_id"),
  relatedCommentId: integer("related_comment_id"),
  sent: boolean("sent").notNull().default(false),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type NotificationLog = typeof notificationLogsTable.$inferSelect;
