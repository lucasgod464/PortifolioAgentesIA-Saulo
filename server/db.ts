import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Variáveis exportadas que serão inicializadas
export let pool: Pool;
export let db: ReturnType<typeof drizzle>;

// Flag para rastrear se já foi inicializado
let dbInitialized = false;

/**
 * Inicializa o banco de dados usando variáveis de ambiente
 */
export async function initializeDbConnection(): Promise<void> {
  if (dbInitialized) {
    console.log("🔄 Conexão de banco já inicializada.");
    return;
  }

  console.log("🔧 Conectando ao banco de dados PostgreSQL...");

  // Verificar se temos uma DATABASE_URL válida
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL não encontrada. Certifique-se de que o banco de dados PostgreSQL está provisionado.",
    );
  }

  console.log(
    `✅ DATABASE_URL encontrada (variáveis de ambiente):`,
    "***" + process.env.DATABASE_URL.substring(process.env.DATABASE_URL.indexOf("@")),
  );

  // Criar pool de conexões
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  // Evento para monitorar erros na pool de conexões
  pool.on("error", (err) => {
    console.error("❌ Erro inesperado no pool de conexões:", err.message);
  });

  console.log(`✅ Pool de conexões configurado com sucesso usando variáveis de ambiente!`);

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
