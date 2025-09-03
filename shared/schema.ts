import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Tabela de usuários para autenticação
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("isAdmin").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Tabela de agentes (correspondente ao hardcoded no client)
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Tabela de prompts dos agentes
export const agentPrompts = pgTable("agent_prompts", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  prompt: text("prompt").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// Define relações
export const agentsRelations = relations(agents, ({ many }) => ({
  prompts: many(agentPrompts),
}));

export const agentPromptsRelations = relations(agentPrompts, ({ one }) => ({
  agent: one(agents, {
    fields: [agentPrompts.agentId],
    references: [agents.id],
  }),
}));

// Schemas para inserção
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export const insertAgentSchema = createInsertSchema(agents);

export const insertAgentPromptSchema = createInsertSchema(agentPrompts).pick({
  agentId: true,
  prompt: true,
  isActive: true,
});

// Tipos para TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertAgentPrompt = z.infer<typeof insertAgentPromptSchema>;
export type AgentPrompt = typeof agentPrompts.$inferSelect;
