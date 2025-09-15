import { Express } from "express";
import { storage } from "./storage";
import { isAdmin, isAuthenticated } from "./auth";
import { insertAgentPromptSchema, insertAgentSchema, insertAssistantsPortfolioSchema } from "@shared/schema";

export function setupApiRoutes(app: Express) {
  // API routes para agentes
  app.get("/api/agents", async (req, res, next) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ error: "Agente não encontrado" });
      }

      res.json(agent);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/agents", isAdmin, async (req, res, next) => {
    try {
      const validationResult = insertAgentSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Dados inválidos", details: validationResult.error });
      }

      const newAgent = await storage.createAgent(validationResult.data);
      res.status(201).json(newAgent);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/agents/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const validationResult = insertAgentSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Dados inválidos", details: validationResult.error });
      }

      const updatedAgent = await storage.updateAgent(id, validationResult.data);
      if (!updatedAgent) {
        return res.status(404).json({ error: "Agente não encontrado" });
      }

      res.json(updatedAgent);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/agents/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      // Verifica se existe
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ error: "Agente não encontrado" });
      }

      await storage.deleteAgent(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // API routes para prompts de agentes
  app.get("/api/agents/:agentId/prompts", async (req, res, next) => {
    try {
      const agentId = parseInt(req.params.agentId);
      if (isNaN(agentId)) {
        return res.status(400).json({ error: "ID de agente inválido" });
      }

      // Verifica se o agente existe
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agente não encontrado" });
      }

      const prompts = await storage.getAgentPrompts(agentId);
      res.json(prompts);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/agents/:agentId/active-prompt", async (req, res, next) => {
    try {
      const agentId = parseInt(req.params.agentId);
      if (isNaN(agentId)) {
        return res.status(400).json({ error: "ID de agente inválido" });
      }

      // Verifica se o agente existe
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agente não encontrado" });
      }

      const prompt = await storage.getActiveAgentPrompt(agentId);
      if (!prompt) {
        return res.status(404).json({ error: "Nenhum prompt ativo encontrado para este agente" });
      }

      res.json(prompt);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/agents/:agentId/prompts", isAdmin, async (req, res, next) => {
    try {
      const agentId = parseInt(req.params.agentId);
      if (isNaN(agentId)) {
        return res.status(400).json({ error: "ID de agente inválido" });
      }

      // Verifica se o agente existe
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agente não encontrado" });
      }

      // Inclui o agentId no corpo da requisição
      const data = { ...req.body, agentId };
      const validationResult = insertAgentPromptSchema.safeParse(data);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Dados inválidos", details: validationResult.error });
      }

      const newPrompt = await storage.createAgentPrompt(validationResult.data);
      res.status(201).json(newPrompt);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/agent-prompts/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      const validationResult = insertAgentPromptSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Dados inválidos", details: validationResult.error });
      }

      const updatedPrompt = await storage.updateAgentPrompt(id, validationResult.data);
      if (!updatedPrompt) {
        return res.status(404).json({ error: "Prompt não encontrado" });
      }

      res.json(updatedPrompt);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/agent-prompts/:id", isAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }

      await storage.deleteAgentPrompt(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // API routes para assistants portfolio
  app.get("/api/assistants-portfolio", isAdmin, async (req, res, next) => {
    try {
      const assistants = await storage.getAssistantsPortfolio();
      res.json(assistants);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/assistants-portfolio/:id", isAdmin, async (req, res, next) => {
    try {
      const id = req.params.id;
      const assistant = await storage.getAssistantPortfolio(id);
      if (!assistant) {
        return res.status(404).json({ error: "Assistente não encontrado" });
      }
      res.json(assistant);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/assistants-portfolio", isAdmin, async (req, res, next) => {
    try {
      const validationResult = insertAssistantsPortfolioSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Dados inválidos", details: validationResult.error });
      }

      const newAssistant = await storage.createAssistantPortfolio(validationResult.data);
      res.status(201).json(newAssistant);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/assistants-portfolio/:id", isAdmin, async (req, res, next) => {
    try {
      const id = req.params.id;
      const validationResult = insertAssistantsPortfolioSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Dados inválidos", details: validationResult.error });
      }

      const updatedAssistant = await storage.updateAssistantPortfolio(id, validationResult.data);
      if (!updatedAssistant) {
        return res.status(404).json({ error: "Assistente não encontrado" });
      }

      res.json(updatedAssistant);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/assistants-portfolio/:id", isAdmin, async (req, res, next) => {
    try {
      const id = req.params.id;
      await storage.deleteAssistantPortfolio(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Rota para retornar configurações do ambiente em tempo real
  app.get("/api/config", (req, res) => {
    try {
      // Função para criar configuração de agente a partir de variáveis de ambiente
      const createAgentConfig = (id: number) => {
        const envPrefix = `VITE_AGENT_${id}`;
        return {
          id,
          visible: process.env[`${envPrefix}_VISIBLE`] !== 'false', // Por padrão visível, exceto se explicitamente false
          icon: process.env[`${envPrefix}_ICON`],
          title: process.env[`${envPrefix}_TITLE`],
          description: process.env[`${envPrefix}_DESCRIPTION`],
          initialMessage: process.env[`${envPrefix}_INITIAL_MESSAGE`],
          webhookName: process.env[`${envPrefix}_WEBHOOK_NAME`]
        };
      };

      // Configurações dos agentes (até 20)
      const agents = Array.from({ length: 20 }, (_, i) => createAgentConfig(i + 1))
        .filter(agent => 
          // Filtra apenas agentes que têm pelo menos uma configuração definida ou são explicitamente visíveis
          agent.visible || agent.icon || agent.title || agent.description || agent.initialMessage || agent.webhookName
        );

      const config = {
        logoUrl: process.env.VITE_LOGO_URL || 'https://static.vecteezy.com/system/resources/previews/009/384/620/original/ai-tech-artificial-intelligence-clipart-design-illustration-free-png.png',
        faviconUrl: process.env.VITE_FAVICON_URL || 'https://static.vecteezy.com/system/resources/previews/009/384/620/original/ai-tech-artificial-intelligence-clipart-design-illustration-free-png.png',
        webhookUrl: process.env.VITE_WEBHOOK_URL || 'https://webhook.dev.testandoaulanapratica.shop/webhook/portfolio_virtual',
        whatsappNumber: process.env.VITE_WHATSAPP_NUMBER || '5544999998888',
        siteTitle: process.env.VITE_SITE_TITLE || 'NexusAI - Agentes de Inteligência Artificial',
        logoLink: process.env.VITE_LOGO_LINK || '/',
        agents
      };
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Erro ao obter configurações" });
    }
  });
}