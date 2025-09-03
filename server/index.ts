import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { serveStaticResiliente } from "./staticWrapper";
import dotenv from "dotenv";
import { initializeDatabase } from "./initializeDatabase";

// Carrega as variáveis de ambiente do arquivo .env e .env.local
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Inicializa o banco de dados antes de configurar as rotas
    await initializeDatabase();
    console.log('Banco de dados verificado e inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1); // Encerra o processo se o banco de dados não puder ser inicializado
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  try {
    const isDev = process.env.NODE_ENV !== 'production';
    log(`🔧 Modo: ${isDev ? 'desenvolvimento' : 'produção'}`);
    
    if (isDev) {
      await setupVite(app, server);
    } else {
      // Tenta primeiro usar a função resiliente
      try {
        serveStaticResiliente(app);
        log('✅ Arquivos estáticos servidos com função resiliente.');
      } catch (error) {
        // Se falhar, tenta a função original como fallback
        log(`⚠️ Erro ao usar função resiliente: ${error}`);
        log('⚠️ Tentando função original como fallback...');
        serveStatic(app);
      }
    }
  } catch (error) {
    log(`❌ ERRO AO SERVIR ARQUIVOS ESTÁTICOS: ${error}`);
    
    // Cria um handler de fallback para pelo menos servir a API
    app.use('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        next(); // Deixa a API funcionar
      } else {
        // Retorna uma página simples
        res.set('Content-Type', 'text/html');
        res.send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>IA Makers Club - API</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1 { color: #5f3dc4; }
                .message { background: #f0f0f0; padding: 20px; border-radius: 5px; }
                .error { color: #721c24; background-color: #f8d7da; padding: 10px; border-radius: 5px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <h1>IA Makers Club - API</h1>
              <div class="message">
                <p>A API está funcionando corretamente, mas não foi possível carregar a interface.</p>
                <p>Por favor, execute <code>npm run build</code> para criar os arquivos da interface ou contate o suporte.</p>
              </div>
              <div class="error">
                <strong>Erro:</strong> ${error instanceof Error ? error.message : String(error)}
              </div>
            </body>
          </html>
        `);
      }
    });
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`✨ Servidor iniciado na porta ${port}`);
    log(`🔗 Database URL: ${process.env.DATABASE_URL?.split('@')[1] || 'Configurada via variáveis de ambiente'}`);
  });
})();
