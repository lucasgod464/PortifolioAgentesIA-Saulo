import { db, pool } from './db';
import { sql } from 'drizzle-orm';
import { users, agents, agentPrompts } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from './auth';

// Variável para indicar se já tentamos inicializar o banco
let databaseInitialized = false;

/**
 * Verifica se a tabela especificada existe no banco de dados
 */
async function checkTableExists(tableName: string): Promise<boolean> {
  // Número máximo de tentativas para verificar a tabela
  const maxRetries = 3;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = $1
        );
      `, [tableName]);
      
      return result.rows[0].exists;
    } catch (error) {
      retries++;
      console.error(`Erro ao verificar se a tabela ${tableName} existe (tentativa ${retries}/${maxRetries}):`, error);
      
      if (retries >= maxRetries) {
        console.error(`Número máximo de tentativas atingido ao verificar tabela '${tableName}'.`);
        return false;
      }
      
      // Aguarda um pouco antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return false;
}

/**
 * Cria as tabelas do schema manualmente se necessário
 */
async function createTablesIfNotExist() {
  try {
    // Verifica se a tabela de usuários existe
    const usersTableExists = await checkTableExists('users');
    
    if (!usersTableExists) {
      console.log('🔧 Criando tabelas do banco de dados...');
      
      // Criação da tabela users
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          "isAdmin" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Criação da tabela agents
      await pool.query(`
        CREATE TABLE IF NOT EXISTS agents (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          icon TEXT NOT NULL,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Criação da tabela agent_prompts
      await pool.query(`
        CREATE TABLE IF NOT EXISTS agent_prompts (
          id SERIAL PRIMARY KEY,
          "agentId" INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
          prompt TEXT NOT NULL,
          "isActive" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ Tabelas criadas com sucesso!');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  }
}

/**
 * Cria dados iniciais se as tabelas estiverem vazias
 */
async function seedInitialData() {
  try {
    // Verifica se já existem usuários
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      console.log('🌱 Populando banco de dados com dados iniciais...');
      
      // Cria usuário admin
      const adminPassword = await hashPassword('admin');
      await db.insert(users).values({
        username: 'admin',
        password: adminPassword,
        isAdmin: true
      });
      
      // Lista de agentes
      const agentsList = [
        { title: 'Comercial', description: 'Assistente virtual para equipes comerciais e vendas', icon: 'fas fa-briefcase' },
        { title: 'Clínicas', description: 'Assistente especializado para clínicas e consultórios médicos', icon: 'fas fa-clinic-medical' },
        { title: 'Imobiliárias', description: 'Assistente para corretores e profissionais do setor imobiliário', icon: 'fas fa-home' },
        { title: 'Jurídico', description: 'Assistente virtual para escritórios de advocacia e profissionais da área jurídica', icon: 'fas fa-balance-scale' },
        { title: 'Financeiro', description: 'Assistente especializado em finanças, contabilidade e planejamento financeiro', icon: 'fas fa-chart-line' },
        { title: 'Educação', description: 'Assistente virtual para instituições de ensino e professores', icon: 'fas fa-graduation-cap' },
        { title: 'Restaurantes', description: 'Assistente para estabelecimentos gastronômicos e delivery', icon: 'fas fa-utensils' },
        { title: 'Eventos', description: 'Assistente especializado em organização e promoção de eventos', icon: 'fas fa-calendar-alt' },
        { title: 'Recursos Humanos', description: 'Assistente para recrutamento, seleção e gestão de pessoas', icon: 'fas fa-users' },
        { title: 'Saúde', description: 'Assistente virtual para profissionais da área da saúde', icon: 'fas fa-heartbeat' },
        { title: 'Varejo', description: 'Assistente especializado em lojas físicas e e-commerce', icon: 'fas fa-shopping-cart' },
        { title: 'Tecnologia', description: 'Assistente para empresas e profissionais de tecnologia', icon: 'fas fa-laptop-code' }
      ];
      
      // Insere os agentes
      for (const agent of agentsList) {
        await db.insert(agents).values(agent);
      }
      
      console.log('✅ Dados iniciais criados com sucesso!');
    } else {
      console.log('ℹ️ Dados iniciais já existem no banco de dados.');
    }
  } catch (error) {
    console.error('❌ Erro ao criar dados iniciais:', error);
    throw error;
  }
}

/**
 * Função para tentar conectar ao banco de dados com tentativas
 * @param maxRetries Número máximo de tentativas
 * @param retryDelay Intervalo entre tentativas em ms
 */
async function connectWithRetry(maxRetries = 10, retryDelay = 3000): Promise<boolean> {
  let retries = 0;
  
  // Imprime informações de conexão para debug
  console.log('🔍 Tentando conectar ao banco de dados com estas configurações:');
  console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? '***' + process.env.DATABASE_URL.substring(process.env.DATABASE_URL.indexOf('@')) : 'não definido'}`);
  console.log(`- DB_HOST: ${process.env.DB_HOST || 'não definido'}`);
  console.log(`- DB_PORT: ${process.env.DB_PORT || 'não definido'}`);
  console.log(`- DB_USER: ${process.env.DB_USER || 'não definido'}`);
  console.log(`- DB_NAME: ${process.env.DB_NAME || 'não definido'}`);
  
  while (retries < maxRetries) {
    try {
      // Tenta uma consulta simples para verificar a conexão
      await pool.query('SELECT NOW()');
      console.log('✅ Conexão com o banco de dados estabelecida!');
      return true;
    } catch (error: any) {
      retries++;
      console.error(`❌ Tentativa ${retries}/${maxRetries} falhou ao conectar ao banco:`, error?.message || 'Erro desconhecido');
      
      // Diagnóstico adicional
      if (error?.message?.includes('no pg_hba.conf entry')) {
        console.error('⚠️ Erro de autenticação: Verifique as credenciais e permissões do banco de dados.');
      } else if (error?.message?.includes('connect ECONNREFUSED')) {
        console.error('⚠️ Conexão recusada: O servidor de banco de dados pode não estar acessível neste host/porta.');
      } else if (error?.message?.includes('database') && error?.message?.includes('does not exist')) {
        console.error('⚠️ O banco de dados especificado não existe. Verifique o nome do banco e crie-o se necessário.');
      }
      
      if (retries >= maxRetries) {
        console.error('❌ Número máximo de tentativas atingido. Não foi possível conectar ao banco de dados.');
        return false;
      }
      
      // Espera antes de tentar novamente com aumento exponencial do tempo
      const waitTime = retryDelay * Math.pow(1.5, retries - 1);
      console.log(`⏳ Aguardando ${waitTime/1000} segundos antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  return false;
}

/**
 * Inicializa o banco de dados
 */
export async function initializeDatabase() {
  // Se já tentamos inicializar antes, não tente novamente
  if (databaseInitialized) {
    console.log('🔄 Banco de dados já foi inicializado anteriormente.');
    return;
  }
  
  try {
    console.log('🔍 Verificando banco de dados...');
    
    // Primeiro tenta conectar ao banco
    const connected = await connectWithRetry();
    if (!connected) {
      console.error('❌ Não foi possível conectar ao banco de dados após várias tentativas.');
      return;
    }
    
    // Verifica e cria tabelas se necessário
    const tablesCreated = await createTablesIfNotExist();
    
    // Se as tabelas foram criadas ou já existiam, verifica os dados iniciais
    await seedInitialData();
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    databaseInitialized = true;
  } catch (error: any) {
    console.error('❌ Falha ao inicializar banco de dados:', error);
    console.error('Detalhes do erro:', error instanceof Error ? error.message : String(error));
    console.error('Verifique se as variáveis de ambiente DATABASE_URL, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD e DB_NAME estão configuradas corretamente.');
    
    // Não lança exceção para permitir que o servidor continue funcionando com operações que não precisam do banco
    // O banco tentará se reconectar nas próximas solicitações
  }
}