import {
  pgTable,
  uuid,
  text,
  boolean,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

// schema for the todos table
export const todos = pgTable("todos", {
  id: uuid("id").defaultRandom().primaryKey(),
  task: text("task").notNull(),
  completed: boolean("completed").default(false).notNull(),
  dateString: varchar("date_string", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
