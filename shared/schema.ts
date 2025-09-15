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
  initialMessage: text("initial_message"),
  webhookName: text("webhook_name"),
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

// Tabela de configurações do sistema
export const siteConfigs = pgTable("site_configs", {
  id: serial("id").primaryKey(),
  siteTitle: text("site_title").notNull().default("NexusAI - Agentes de Inteligência Artificial"),
  logoUrl: text("logo_url").notNull().default("https://static.vecteezy.com/system/resources/previews/009/384/620/original/ai-tech-artificial-intelligence-clipart-design-illustration-free-png.png"),
  logoLink: text("logo_link").notNull().default("/"),
  faviconUrl: text("favicon_url").notNull().default("https://static.vecteezy.com/system/resources/previews/009/384/620/original/ai-tech-artificial-intelligence-clipart-design-illustration-free-png.png"),
  webhookUrl: text("webhook_url").notNull().default("https://webhook.dev.testandoaulanapratica.shop/webhook/portfolio_virtual"),
  whatsappNumber: text("whatsapp_number").notNull().default("5544999998888"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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

export const insertSiteConfigSchema = createInsertSchema(siteConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export type InsertSiteConfig = z.infer<typeof insertSiteConfigSchema>;
export type SiteConfig = typeof siteConfigs.$inferSelect;

// Esquemas para configuração de banco de dados (não armazenado no DB)
export const dbConfigSchema = z.object({
  host: z.string().min(1, "Host é obrigatório"),
  port: z.number().int().min(1).max(65535, "Porta deve estar entre 1 e 65535"),
  user: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().optional(),
  database: z.string().min(1, "Nome do banco é obrigatório"),
  sessionTable: z.string().min(1, "Tabela de sessão é obrigatória").default("session"),
});

export const dbConfigMaskedSchema = z.object({
  host: z.string(),
  port: z.number(),
  user: z.string(),
  database: z.string(),
  sessionTable: z.string(),
  passwordMasked: z.boolean().default(true),
});

export const dbConfigTestSchema = dbConfigSchema.extend({
  testConnection: z.boolean().default(true),
});

export type DbConfig = z.infer<typeof dbConfigSchema>;
export type DbConfigMasked = z.infer<typeof dbConfigMaskedSchema>;
export type DbConfigTest = z.infer<typeof dbConfigTestSchema>;
