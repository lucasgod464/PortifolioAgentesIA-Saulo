import { Express } from "express";
import { storage } from "./storage";
import { isAdmin, isAuthenticated, comparePasswords } from "./auth";
import { insertAgentPromptSchema, insertAgentSchema, insertAssistantsPortfolioSchema, insertSiteConfigSchema, dbConfigSchema, dbConfigTestSchema } from "@shared/schema";
import { getMaskedDbConfig, saveDbCredentials, buildDatabaseUrl } from "./dbCredentials";
import { Pool } from "pg";

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

  // API routes para configurações do site
  app.get("/api/site-config", isAdmin, async (req, res, next) => {
    try {
      const config = await storage.getSiteConfig();
      if (!config) {
        return res.status(404).json({ error: "Configurações não encontradas" });
      }
      res.json(config);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/site-config", isAdmin, async (req, res, next) => {
    try {
      const validationResult = insertSiteConfigSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Dados inválidos", details: validationResult.error });
      }

      const updatedConfig = await storage.updateSiteConfig(validationResult.data);
      if (!updatedConfig) {
        return res.status(404).json({ error: "Erro ao atualizar configurações" });
      }

      res.json(updatedConfig);
    } catch (error) {
      next(error);
    }
  });

  // Rota para retornar configurações do banco de dados ou ambiente como fallback
  app.get("/api/config", async (req, res) => {
    try {
      // Busca configurações do banco de dados
      const dbConfig = await storage.getSiteConfig();
      
      // Se não encontrar no banco, usa fallback das variáveis de ambiente
      const config = dbConfig ? {
        logoUrl: dbConfig.logoUrl,
        faviconUrl: dbConfig.faviconUrl,
        webhookUrl: dbConfig.webhookUrl,
        whatsappNumber: dbConfig.whatsappNumber,
        siteTitle: dbConfig.siteTitle,
        logoLink: dbConfig.logoLink,
      } : {
        logoUrl: process.env.VITE_LOGO_URL || 'https://static.vecteezy.com/system/resources/previews/009/384/620/original/ai-tech-artificial-intelligence-clipart-design-illustration-free-png.png',
        faviconUrl: process.env.VITE_FAVICON_URL || 'https://static.vecteezy.com/system/resources/previews/009/384/620/original/ai-tech-artificial-intelligence-clipart-design-illustration-free-png.png',
        webhookUrl: process.env.VITE_WEBHOOK_URL || 'https://webhook.dev.testandoaulanapratica.shop/webhook/portfolio_virtual',
        whatsappNumber: process.env.VITE_WHATSAPP_NUMBER || '5544999998888',
        siteTitle: process.env.VITE_SITE_TITLE || 'NexusAI - Agentes de Inteligência Artificial',
        logoLink: process.env.VITE_LOGO_LINK || '/',
      };
      
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Erro ao obter configurações" });
    }
  });

  // ===========================================
  // API ROUTES PARA CONFIGURAÇÃO DE BANCO DE DADOS
  // ===========================================

  // GET /api/admin/db-config - Retorna configurações mascaradas (sem expor senha)
  app.get("/api/admin/db-config", isAdmin, async (req, res, next) => {
    try {
      if (!process.env.MASTER_KEY) {
        return res.status(500).json({ 
          error: "MASTER_KEY não configurada", 
          message: "Configure a variável MASTER_KEY para gerenciar credenciais de banco de dados" 
        });
      }

      const maskedConfig = await getMaskedDbConfig();
      if (!maskedConfig) {
        return res.status(404).json({ 
          error: "Configurações não encontradas",
          message: "Nenhuma configuração de banco salva encontrada"
        });
      }

      res.json(maskedConfig);
    } catch (error) {
      next(error);
    }
  });

  // POST /api/admin/db-config/test - Testa conexão com o banco (não salva)
  app.post("/api/admin/db-config/test", isAdmin, async (req, res, next) => {
    try {
      const validationResult = dbConfigTestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: validationResult.error 
        });
      }

      const { host, port, user, password, database } = validationResult.data;
      
      // Testa conexão com timeout de 5 segundos
      const testPool = new Pool({
        host,
        port,
        user,
        password,
        database,
        ssl: false,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 1000,
        max: 1, // Apenas uma conexão para teste
      });

      try {
        const client = await testPool.connect();
        await client.query('SELECT 1');
        client.release();
        await testPool.end();

        res.json({ 
          success: true, 
          message: "Conexão testada com sucesso!" 
        });
      } catch (dbError) {
        await testPool.end();
        console.error('Erro no teste de conexão:', dbError);
        
        res.status(400).json({ 
          success: false, 
          error: "Falha na conexão com o banco de dados",
          details: (dbError as Error).message
        });
      }
    } catch (error) {
      next(error);
    }
  });

  // PUT /api/admin/db-config - Salva configurações (requer re-autenticação)
  app.put("/api/admin/db-config", isAdmin, async (req, res, next) => {
    try {
      if (!process.env.MASTER_KEY) {
        return res.status(500).json({ 
          error: "MASTER_KEY não configurada", 
          message: "Configure a variável MASTER_KEY para gerenciar credenciais de banco de dados" 
        });
      }

      // Verifica se tem a senha de confirmação para re-autenticação
      const { confirmPassword, ...dbConfigData } = req.body;
      if (!confirmPassword) {
        return res.status(400).json({ 
          error: "Re-autenticação necessária", 
          message: "Informe sua senha atual para confirmar as alterações" 
        });
      }

      // Verifica a senha do usuário atual
      const currentUser = await storage.getUser(req.user!.id);
      if (!currentUser || !(await comparePasswords(confirmPassword, currentUser.password))) {
        return res.status(401).json({ 
          error: "Senha incorreta", 
          message: "A senha informada não confere com a sua senha atual" 
        });
      }

      // Valida os dados da configuração
      const validationResult = dbConfigSchema.safeParse(dbConfigData);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: validationResult.error 
        });
      }

      // Salva as credenciais criptografadas
      await saveDbCredentials(validationResult.data);

      // Log de auditoria (sem expor dados sensíveis)
      console.log(`🔒 Configurações de banco atualizadas por ${req.user!.username} em ${new Date().toISOString()}`);

      // Retorna configurações mascaradas
      const maskedConfig = await getMaskedDbConfig();
      
      res.json({
        ...maskedConfig,
        message: "Configurações salvas com sucesso! Reinicie o servidor para aplicar as mudanças.",
        requiresRestart: true
      });
    } catch (error) {
      next(error);
    }
  });
}