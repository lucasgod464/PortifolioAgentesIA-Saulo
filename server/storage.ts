import {
  users,
  agents,
  agentPrompts,
  assistantsPortfolio,
  siteConfigs,
  type User,
  type InsertUser,
  type Agent,
  type InsertAgent,
  type AgentPrompt,
  type InsertAgentPrompt,
  type AssistantsPortfolio,
  type InsertAssistantsPortfolio,
  type SiteConfig,
  type InsertSiteConfig
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente
dotenv.config();

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Métodos de usuário
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Métodos de agente
  getAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<boolean>;
  
  // Métodos de prompt
  getAgentPrompts(agentId: number): Promise<AgentPrompt[]>;
  getActiveAgentPrompt(agentId: number): Promise<AgentPrompt | undefined>;
  createAgentPrompt(prompt: InsertAgentPrompt): Promise<AgentPrompt>;
  updateAgentPrompt(id: number, prompt: Partial<InsertAgentPrompt>): Promise<AgentPrompt | undefined>;
  deleteAgentPrompt(id: number): Promise<boolean>;
  
  // Métodos de assistants portfolio
  getAssistantsPortfolio(): Promise<AssistantsPortfolio[]>;
  getAssistantPortfolio(id: string): Promise<AssistantsPortfolio | undefined>;
  createAssistantPortfolio(assistant: InsertAssistantsPortfolio): Promise<AssistantsPortfolio>;
  updateAssistantPortfolio(id: string, assistant: Partial<InsertAssistantsPortfolio>): Promise<AssistantsPortfolio | undefined>;
  deleteAssistantPortfolio(id: string): Promise<boolean>;
  
  // Métodos de configurações do site
  getSiteConfig(): Promise<SiteConfig | undefined>;
  updateSiteConfig(config: Partial<InsertSiteConfig>): Promise<SiteConfig | undefined>;
  
  // Propriedades
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    // Usa as variáveis de ambiente do arquivo .env para a configuração da sessão
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: process.env.DB_SESSION_TABLE || 'session' // Nome da tabela de sessão, pode ser configurado no .env
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Agent methods
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }
  
  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }
  
  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }
  
  async updateAgent(id: number, agent: Partial<InsertAgent>): Promise<Agent | undefined> {
    const [updatedAgent] = await db
      .update(agents)
      .set(agent)
      .where(eq(agents.id, id))
      .returning();
    return updatedAgent;
  }
  
  async deleteAgent(id: number): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id));
    return true; // No count in Drizzle, assume success
  }
  
  // AgentPrompt methods
  async getAgentPrompts(agentId: number): Promise<AgentPrompt[]> {
    return await db
      .select()
      .from(agentPrompts)
      .where(eq(agentPrompts.agentId, agentId))
      .orderBy(desc(agentPrompts.createdAt));
  }
  
  async getActiveAgentPrompt(agentId: number): Promise<AgentPrompt | undefined> {
    const [prompt] = await db
      .select()
      .from(agentPrompts)
      .where(
        and(
          eq(agentPrompts.agentId, agentId),
          eq(agentPrompts.isActive, true)
        )
      )
      .orderBy(desc(agentPrompts.updatedAt))
      .limit(1);
    
    return prompt;
  }
  
  async createAgentPrompt(prompt: InsertAgentPrompt): Promise<AgentPrompt> {
    // Se o novo prompt for ativo, desativamos todos os outros prompts deste agente
    if (prompt.isActive) {
      await db
        .update(agentPrompts)
        .set({ isActive: false })
        .where(eq(agentPrompts.agentId, prompt.agentId));
    }
    
    const [newPrompt] = await db.insert(agentPrompts).values(prompt).returning();
    return newPrompt;
  }
  
  async updateAgentPrompt(id: number, prompt: Partial<InsertAgentPrompt>): Promise<AgentPrompt | undefined> {
    // Se o prompt atualizado for ativo, desativamos todos os outros prompts deste agente
    if (prompt.isActive) {
      const [currentPrompt] = await db
        .select()
        .from(agentPrompts)
        .where(eq(agentPrompts.id, id));
      
      if (currentPrompt) {
        await db
          .update(agentPrompts)
          .set({ isActive: false })
          .where(eq(agentPrompts.agentId, currentPrompt.agentId));
      }
    }
    
    const [updatedPrompt] = await db
      .update(agentPrompts)
      .set(prompt)
      .where(eq(agentPrompts.id, id))
      .returning();
    
    return updatedPrompt;
  }
  
  async deleteAgentPrompt(id: number): Promise<boolean> {
    await db.delete(agentPrompts).where(eq(agentPrompts.id, id));
    return true;
  }
  
  // Assistants Portfolio methods
  async getAssistantsPortfolio(): Promise<AssistantsPortfolio[]> {
    return await db.select().from(assistantsPortfolio).orderBy(assistantsPortfolio.nomeAgente);
  }
  
  async getAssistantPortfolio(id: string): Promise<AssistantsPortfolio | undefined> {
    const [assistant] = await db.select().from(assistantsPortfolio).where(eq(assistantsPortfolio.id, id));
    return assistant;
  }
  
  async createAssistantPortfolio(assistant: InsertAssistantsPortfolio): Promise<AssistantsPortfolio> {
    const [newAssistant] = await db.insert(assistantsPortfolio).values(assistant).returning();
    return newAssistant;
  }
  
  async updateAssistantPortfolio(id: string, assistant: Partial<InsertAssistantsPortfolio>): Promise<AssistantsPortfolio | undefined> {
    const [updatedAssistant] = await db
      .update(assistantsPortfolio)
      .set(assistant)
      .where(eq(assistantsPortfolio.id, id))
      .returning();
    
    return updatedAssistant;
  }
  
  async deleteAssistantPortfolio(id: string): Promise<boolean> {
    await db.delete(assistantsPortfolio).where(eq(assistantsPortfolio.id, id));
    return true;
  }
  
  // Site Config methods
  async getSiteConfig(): Promise<SiteConfig | undefined> {
    const [config] = await db.select().from(siteConfigs).limit(1);
    return config;
  }
  
  async updateSiteConfig(config: Partial<InsertSiteConfig>): Promise<SiteConfig | undefined> {
    // Como só temos uma configuração, vamos sempre atualizar o primeiro registro
    const [existingConfig] = await db.select().from(siteConfigs).limit(1);
    
    if (existingConfig) {
      const [updatedConfig] = await db
        .update(siteConfigs)
        .set({ ...config, updatedAt: new Date() })
        .where(eq(siteConfigs.id, existingConfig.id))
        .returning();
      
      return updatedConfig;
    }
    
    // Se não existir, cria um novo
    const [newConfig] = await db.insert(siteConfigs).values(config).returning();
    return newConfig;
  }
}

export const storage = new DatabaseStorage();
