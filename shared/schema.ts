import { pgTable, text, serial, integer, boolean, timestamp, bigserial } from "drizzle-orm/pg-core";
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

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

export const insertAgentPromptSchema = createInsertSchema(agentPrompts).pick({
  agentId: true,
  prompt: true,
  isActive: true,
});

// Tabela de assistentes portfolio
export const assistantsPortfolio = pgTable("assistants_portfolio", {
  id: text("id").primaryKey(),
  nomeAgente: text("nome_agente").notNull(),
  promptAgente: text("prompt_agente"),
  assistantId: text("assistant_id"),
  model: text("model"),
  tools: text("tools"),
  temperatura: text("temperatura"),
});

// Tabela de leads portfolio
export const leadsPortfolio = pgTable("leads_portfolio", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  sessionID: text("sessionID"),
  timestamp: text("timestamp"),
  threadId: text("thread_id"),
  possuiThreadId: boolean("possui_thread_id"),
  nomeCompleto: text("nome_completo"),
  telefone: text("telefone"),
});

// Schemas para inserção das novas tabelas
export const insertAssistantsPortfolioSchema = createInsertSchema(assistantsPortfolio);
export const insertLeadsPortfolioSchema = createInsertSchema(leadsPortfolio).omit({
  id: true, // Remove ID pois é auto-gerado
});

// Tipos para TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertAgentPrompt = z.infer<typeof insertAgentPromptSchema>;
export type AgentPrompt = typeof agentPrompts.$inferSelect;

export type InsertAssistantsPortfolio = z.infer<typeof insertAssistantsPortfolioSchema>;
export type AssistantsPortfolio = typeof assistantsPortfolio.$inferSelect;

export type InsertLeadsPortfolio = z.infer<typeof insertLeadsPortfolioSchema>;
export type LeadsPortfolio = typeof leadsPortfolio.$inferSelect;
