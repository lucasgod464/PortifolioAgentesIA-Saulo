import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import dotenv from "dotenv";
import { loadDbCredentials, buildDatabaseUrl } from "./dbCredentials";

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Variáveis exportadas que serão inicializadas
export let pool: Pool;
export let db: ReturnType<typeof drizzle>;

// Flag para rastrear se já foi inicializado
let dbInitialized = false;

/**
 * Inicializa o banco de dados carregando credenciais e criando conexões
 */
export async function initializeDbConnection(): Promise<void> {
  if (dbInitialized) {
    console.log("🔄 Conexão de banco já inicializada.");
    return;
  }

  console.log("🔧 Conectando ao banco de dados PostgreSQL local no Replit...");

  // Tenta carregar credenciais criptografadas primeiro
  let finalDatabaseUrl = process.env.DATABASE_URL;
  let sourceInfo = "variáveis de ambiente";

  try {
    const dbConfig = await loadDbCredentials();
    if (dbConfig) {
      finalDatabaseUrl = buildDatabaseUrl(dbConfig);
      sourceInfo = "credenciais armazenadas";
      console.log("🔒 Carregando configurações do banco a partir de credenciais armazenadas...");
      
      // Atualiza a variável de ambiente para compatibilidade
      process.env.DATABASE_URL = finalDatabaseUrl;
    }
  } catch (error) {
    console.warn("⚠️ Não foi possível carregar credenciais armazenadas, usando variáveis de ambiente:", error);
  }

  // Verificar se temos uma DATABASE_URL válida
  if (!finalDatabaseUrl) {
    throw new Error(
      "DATABASE_URL não encontrada. Certifique-se de que o banco de dados PostgreSQL está provisionado ou configure credenciais via interface admin.",
    );
  }

  console.log(
    `✅ DATABASE_URL encontrada (${sourceInfo}):`,
    "***" + finalDatabaseUrl.substring(finalDatabaseUrl.indexOf("@")),
  );

  // Criar pool de conexões
  pool = new Pool({
    connectionString: finalDatabaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  // Evento para monitorar erros na pool de conexões
  pool.on("error", (err) => {
    console.error("❌ Erro inesperado no pool de conexões:", err.message);
  });

  console.log(`✅ Pool de conexões configurado com sucesso usando ${sourceInfo}!`);

  // Criação da instância Drizzle
  db = drizzle(pool, { schema });
  
  dbInitialized = true;
}

/**
 * Garante que a conexão está inicializada antes de usar
 */
export async function ensureDbConnection(): Promise<void> {
  if (!dbInitialized) {
    await initializeDbConnection();
  }
}
